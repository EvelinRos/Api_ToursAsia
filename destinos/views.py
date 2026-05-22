from django.urls import reverse_lazy, reverse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic import ListView, DetailView, TemplateView, View
from django.utils import timezone
from django.db.models import Sum, Count
from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .models import Destino, Tour, Reserva
from .serializers import (
    DestinoSerializer, TourReadSerializer, TourWriteSerializer,
    ReservaReadSerializer, ReservaWriteSerializer, ReservaStatusSerializer
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

class ReservaView(TemplateView):
    template_name = 'booking_system.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        tour_id = self.request.GET.get('tour')
        tour = None
        
        if tour_id:
            try:
                tour = Tour.objects.get(pk=tour_id)
                context['tour'] = tour
                context['tour_name'] = tour.name
                context['tour_description'] = tour.description
            except Tour.DoesNotExist:
                pass
        
        if self.request.user.is_authenticated:
            context['user_name'] = self.request.user.first_name
            context['user_email'] = self.request.user.email
        
        return context
    
    def post(self, request):
        import json
        from django.http import JsonResponse
        
        try:
            data = json.loads(request.body)
            
            tour_id = data.get('tour_id')
            if not tour_id:
                tour_id = request.GET.get('tour', 1)
            
            tour = Tour.objects.get(pk=tour_id)
            
            adults = int(data.get('adultos', 1))
            children = int(data.get('ninos', 0))
            fecha = data.get('fecha')
            hora = data.get('hora')
            nombre = data.get('nombre')
            apellido = data.get('apellido')
            email = data.get('email')
            pais = data.get('pais', '+57')
            telefono = data.get('telefono')
            
            PRICE_ADULTO = 850
            PRICE_NINO = 600
            total_amount = (adults * PRICE_ADULTO) + (children * PRICE_NINO)
            
            reserva = Reserva.objects.create(
                tour=tour,
                date=fecha,
                time_slot=hora,
                adults=adults,
                children=children,
                customer_name=nombre,
                customer_lastname=apellido,
                customer_email=email,
                customer_phone=telefono,
                customer_country=pais,
                total_amount=Decimal(str(total_amount)),
                subtotal=Decimal(str(total_amount)),
                user=request.user if request.user.is_authenticated else None,
                status='pendiente'
            )
            
            return JsonResponse({
                'success': True,
                'reserva_id': reserva.id,
                'numero_reserva': f'RVA-{str(reserva.id).zfill(5)}',
                'redirect': reverse('reserva-confirmada', kwargs={'pk': reserva.pk})
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=400)

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

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    filterset_fields = ['tour', 'status']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        if self.action in ['list', 'retrieve', 'cambiar_estado', 'destroy']:
            return [IsAdminUser()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'cambiar_estado':
            return ReservaStatusSerializer
        if self.action in ['list', 'retrieve']:
            return ReservaReadSerializer
        return ReservaWriteSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reserva.objects.all().order_by('-created_at')
        return Reserva.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(
            user=user,
            customer_name=user.first_name,
            customer_lastname=user.last_name,
            customer_email=user.email,
            customer_phone=user.phone,
            status='pendiente'
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def cambiar_estado(self, request, pk=None):
        reserva = self.get_object()
        serializer = ReservaStatusSerializer(reserva, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ReservaReadSerializer(reserva).data)
