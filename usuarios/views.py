from django.contrib.auth.mixins import UserPassesTestMixin
from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DeleteView, DetailView
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.views import View
import json

from .forms import RegistroClienteForm
from .models import Usuario
from destinos.models import Destino, Tour, Reserva

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class StaffRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_authenticated and self.request.user.is_staff


# --- JWT AUTH ---

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_staff'] = user.is_staff
        return token


class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class RegistroAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        form = RegistroClienteForm(request.data)
        if form.is_valid():
            form.save()
            return Response({'mensaje': 'Usuario creado correctamente.'}, status=status.HTTP_201_CREATED)
        return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


# --- DASHBOARD VISTAS (Django Admin Web) ---

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


# --- UTILIDADES DASHBOARD ---

class ActualizarEstadoReservaView(StaffRequiredMixin, View):
    def post(self, request):
        data = json.loads(request.body)
        reserva_id = data.get('id')
        nuevo_estado = data.get('estado')
        ESTADOS_VALIDOS = ['pendiente', 'confirmada', 'rechazada', 'cancelada']
        if nuevo_estado not in ESTADOS_VALIDOS:
            return JsonResponse({'success': False, 'error': 'Estado inválido'})
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
