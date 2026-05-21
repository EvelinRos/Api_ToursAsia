from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView, TemplateView, View, ListView, UpdateView, DeleteView, DetailView
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.core.paginator import Paginator
import json

from .forms import RegistroClienteForm
from .models import Usuario
from destinos.models import Destino, Tour, Reserva

class StaffRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff

class ClienteLoginView(LoginView):
    template_name = 'usuarios/login.html'
    
    def get_success_url(self):
        return self.request.GET.get('next', '/')

class ClienteLogoutView(LogoutView):
    next_page = '/'

class ClienteRegistroView(CreateView):
    model = Usuario
    form_class = RegistroClienteForm
    template_name = 'usuarios/registro.html'
    success_url = reverse_lazy('cliente-login')

    def form_valid(self, form):
        response = super().form_valid(form)
        return response

class MisReservasView(TemplateView):
    template_name = 'mis_reservas.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context['reservas'] = self.request.user.reservas.all().order_by('-created_at')
        else:
            email = self.request.GET.get('email')
            if email:
                context['reservas'] = Reserva.objects.filter(customer_email=email).order_by('-created_at')
                context['searched_email'] = email
        return context

class MiReservaDetalleView(DetailView):
    model = Reserva
    template_name = 'mi_reserva_detalle.html'
    context_object_name = 'reserva'

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated:
            return qs.filter(user=self.request.user)
        return qs

class AdminLoginView(LoginView):
    template_name = 'usuarios/admin_login.html'
    
    def form_valid(self, form):
        user = form.get_user()
        if user.is_staff:
            return super().form_valid(form)
        else:
            return self.form_invalid(form)

    def get_success_url(self):
        return reverse_lazy('dashboard')

class AdminLogoutView(LogoutView):
    next_page = reverse_lazy('admin-login')

class DashboardView(StaffRequiredMixin, TemplateView):
    template_name = 'dashboard/index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_reservas'] = Reserva.objects.count()
        context['ingresos'] = sum(r.total_amount for r in Reserva.objects.all())
        context['tours_activos'] = Tour.objects.count()
        context['pendientes'] = Reserva.objects.filter(status='pendiente').count()
        context['ultimas_reservas'] = Reserva.objects.order_by('-created_at')[:10]
        return context

class DashboardDestinosView(StaffRequiredMixin, ListView):
    model = Destino
    template_name = 'dashboard/destinos.html'
    context_object_name = 'destinos'

class DashboardDestinoCreateView(StaffRequiredMixin, CreateView):
    model = Destino
    template_name = 'dashboard/destino_form.html'
    fields = '__all__'
    success_url = reverse_lazy('dashboard-destinos')

class DashboardDestinoUpdateView(StaffRequiredMixin, UpdateView):
    model = Destino
    template_name = 'dashboard/destino_form.html'
    fields = '__all__'
    success_url = reverse_lazy('dashboard-destinos')

class DashboardDestinoDeleteView(StaffRequiredMixin, DeleteView):
    model = Destino
    template_name = 'dashboard/destino_confirm_delete.html'
    success_url = reverse_lazy('dashboard-destinos')

class DashboardToursView(StaffRequiredMixin, ListView):
    model = Tour
    template_name = 'dashboard/tours.html'
    context_object_name = 'tours'

class DashboardTourCreateView(StaffRequiredMixin, CreateView):
    model = Tour
    template_name = 'dashboard/tour_form.html'
    fields = '__all__'
    success_url = reverse_lazy('dashboard-tours')

class DashboardTourUpdateView(StaffRequiredMixin, UpdateView):
    model = Tour
    template_name = 'dashboard/tour_form.html'
    fields = '__all__'
    success_url = reverse_lazy('dashboard-tours')

class DashboardTourDeleteView(StaffRequiredMixin, DeleteView):
    model = Tour
    template_name = 'dashboard/tour_confirm_delete.html'
    success_url = reverse_lazy('dashboard-tours')

class DashboardReservasView(StaffRequiredMixin, ListView):
    model = Reserva
    template_name = 'dashboard/reservas.html'
    context_object_name = 'reservas'

class DashboardReservaDetalleView(StaffRequiredMixin, DetailView):
    model = Reserva
    template_name = 'dashboard/reserva_detalle.html'
    context_object_name = 'reserva'

class DashboardUsuariosView(StaffRequiredMixin, ListView):
    model = Usuario
    template_name = 'dashboard/usuarios.html'
    context_object_name = 'usuarios'
    
    def get_queryset(self):
        return Usuario.objects.filter(is_staff=False)

class VerificarEmailView(View):
    def get(self, request):
        email = request.GET.get('email', '')
        existe = Usuario.objects.filter(email=email).exists()
        return JsonResponse({'existe': existe})
        
    def post(self, request):
        email = request.POST.get('email', '')
        existe = Usuario.objects.filter(email=email).exists()
        return JsonResponse({'existe': existe})

class AplicarCuponView(View):
    def post(self, request):
        data = json.loads(request.body)
        codigo = data.get('codigo', '')
        if codigo == 'DESCUENTO10':
            return JsonResponse({'valido': True, 'descuento': 10})
        return JsonResponse({'valido': False})

class ActualizarEstadoReservaView(StaffRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        reserva_id = data.get('id')
        nuevo_estado = data.get('estado')
        try:
            reserva = Reserva.objects.get(id=reserva_id)
            reserva.status = nuevo_estado
            reserva.save()
            return JsonResponse({'success': True})
        except Reserva.DoesNotExist:
            return JsonResponse({'success': False})

class TogglePopularTourView(StaffRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        tour_id = data.get('id')
        try:
            tour = Tour.objects.get(id=tour_id)
            tour.is_popular = not tour.is_popular
            tour.save()
            return JsonResponse({'success': True, 'is_popular': tour.is_popular})
        except Tour.DoesNotExist:
            return JsonResponse({'success': False})
