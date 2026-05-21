from django.urls import reverse_lazy, reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic import ListView, DetailView, TemplateView, View
from django.utils import timezone
from django.db.models import Sum, Count
from rest_framework import viewsets
from decimal import Decimal

from .models import Destino, Tour, Reserva
from .serializers import (
    DestinoSerializer, 
    TourReadSerializer, TourWriteSerializer,
    ReservaReadSerializer, ReservaWriteSerializer
)

class ReadWriteSerializerMixin:
    read_serializer_class = None
    write_serializer_class = None
    
    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return self.read_serializer_class
        return self.write_serializer_class

class HomeView(TemplateView):
    template_name = 'home.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['destinos_destacados'] = Destino.objects.all()[:6]
        context['tours_populares'] = Tour.objects.filter(is_popular=True)[:3]
        if not context['tours_populares']:
            context['tours_populares'] = Tour.objects.all()[:3]
        return context

class DestinoListView(ListView):
    model = Destino
    template_name = 'destinos/destino_list.html'
    context_object_name = 'destinos'

class DestinoDetailView(DetailView):
    model = Destino
    template_name = 'destinos/destino_detail.html'
    context_object_name = 'destino'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['tours'] = self.object.tours.all()
        return context

class TourListView(ListView):
    model = Tour
    template_name = 'destinos/tour_list.html'
    context_object_name = 'tours'
    paginate_by = 9

    def get_queryset(self):
        qs = super().get_queryset()
        destino = self.request.GET.get('destino')
        precio_min = self.request.GET.get('precio_min')
        precio_max = self.request.GET.get('precio_max')
        duracion = self.request.GET.getlist('duracion')
        orden = self.request.GET.get('orden', 'popular')
        
        if destino:
            qs = qs.filter(destino_id=destino)
        if precio_min:
            qs = qs.filter(price__gte=precio_min)
        if precio_max:
            qs = qs.filter(price__lte=precio_max)
        
        if duracion:
            duracion_filters = models.Q()
            for d in duracion:
                if d == '1-3':
                    duracion_filters |= models.Q(duration__lte=3)
                elif d == '4-7':
                    duracion_filters |= models.Q(duration__gte=4, duration__lte=7)
                elif d == '8-14':
                    duracion_filters |= models.Q(duration__gte=8, duration__lte=14)
                elif d == '+15':
                    duracion_filters |= models.Q(duration__gte=15)
            qs = qs.filter(duracion_filters)
            
        if orden == 'popular':
            qs = qs.order_by('-is_popular', '-rating')
        elif orden == 'precio_asc':
            qs = qs.order_by('price')
        elif orden == 'precio_desc':
            qs = qs.order_by('-price')
        elif orden == 'reciente':
            qs = qs.order_by('-pub_date')
            
        return qs
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['destinos'] = Destino.objects.all()
        return context

class TourDetailView(DetailView):
    model = Tour
    template_name = 'destinos/tour_detail.html'
    context_object_name = 'tour'

class CheckoutPaso1View(View):
    def get(self, request):
        if 'checkout' not in request.session:
            return redirect('home')
            
        return render(request, 'checkout/paso1.html', {
            'checkout': request.session['checkout']
        })

    def post(self, request):
        checkout = request.session.get('checkout')
        if not checkout:
            return redirect('home')
        checkout['idioma'] = request.POST.get('idioma', 'Español')
        checkout['paso_actual'] = 2
        request.session['checkout'] = checkout
        return redirect('checkout-paso2')

class CheckoutPaso2View(View):
    def get(self, request):
        checkout = request.session.get('checkout')
        if not checkout or checkout.get('paso_actual') < 1:
            return redirect('checkout-paso1')
            
        if request.user.is_authenticated and not checkout.get('email'):
            checkout['nombre'] = request.user.first_name
            checkout['apellido'] = request.user.last_name
            checkout['email'] = request.user.email
            checkout['telefono'] = request.user.phone
            checkout['pais'] = request.user.country
            request.session['checkout'] = checkout

        return render(request, 'checkout/paso2.html', {
            'checkout': checkout
        })

    def post(self, request):
        checkout = request.session.get('checkout')
        if not checkout:
            return redirect('home')
            
        checkout['nombre'] = request.POST.get('first_name')
        checkout['apellido'] = request.POST.get('last_name')
        checkout['email'] = request.POST.get('email')
        checkout['telefono'] = request.POST.get('phone')
        checkout['pais'] = request.POST.get('country')
        checkout['paso_actual'] = 3
        request.session['checkout'] = checkout
        return redirect('checkout-paso3')

class CheckoutPaso3View(View):
    def get(self, request):
        checkout = request.session.get('checkout')
        if not checkout or checkout.get('paso_actual') < 2:
            return redirect('checkout-paso2')
        return render(request, 'checkout/paso3.html', {
            'checkout': checkout
        })

    def post(self, request):
        checkout = request.session.get('checkout')
        if not checkout:
            return redirect('home')
            
        payment_method = request.POST.get('payment_method', 'tarjeta')
        
        tour = Tour.objects.get(pk=checkout['tour_id'])
        reserva = Reserva.objects.create(
            tour=tour,
            date=checkout['fecha'],
            time_slot=checkout['hora'],
            adults=checkout['adultos'],
            children=checkout.get('ninos', 0),
            language=checkout['idioma'],
            customer_name=checkout['nombre'],
            customer_lastname=checkout['apellido'],
            customer_email=checkout['email'],
            customer_phone=checkout['telefono'],
            customer_country=checkout['pais'],
            payment_method=payment_method,
            total_amount=Decimal(str(checkout['total'])),
            subtotal=Decimal(str(checkout['subtotal'])),
            service_fee=Decimal(str(checkout.get('tarifa', 3.00))),
            discount_amount=Decimal(str(checkout.get('descuento', 0.0))),
            user=request.user if request.user.is_authenticated else None,
            status='pendiente'
        )
        
        del request.session['checkout']
        return redirect('reserva-confirmada', pk=reserva.pk)

class ReservaConfirmadaView(DetailView):
    model = Reserva
    template_name = 'checkout/confirmacion.html'

# --- API REST VIEWSETS ---

class DestinoViewSet(viewsets.ModelViewSet):
    queryset = Destino.objects.all()
    serializer_class = DestinoSerializer
    search_fields = ['name', 'country']

class TourViewSet(ReadWriteSerializerMixin, viewsets.ModelViewSet):
    queryset = Tour.objects.all()
    filterset_fields = ['destino']
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return TourReadSerializer
        return TourWriteSerializer

class ReservaViewSet(ReadWriteSerializerMixin, viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    filterset_fields = ['tour', 'status']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ReservaReadSerializer
        return ReservaWriteSerializer
