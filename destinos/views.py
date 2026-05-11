from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from rest_framework import viewsets

from .models import Destino, Tour, Reserva
from .forms import DestinoForm, TourForm, ReservaForm
from .serializers import (
    DestinoSerializer, 
    TourReadSerializer, TourWriteSerializer,
    ReservaReadSerializer, ReservaWriteSerializer
)

# --- Mixins ---

class ReadWriteSerializerMixin:
    read_serializer_class = None
    write_serializer_class = None
    
    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return self.read_serializer_class
        return self.write_serializer_class

# --- WEB HTML VIEWS ---

class DestinoListView(ListView):
    model = Destino

class DestinoDetailView(DetailView):
    model = Destino
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Fix: passing tours explicitly using related_name 'tours'
        context['tours'] = self.object.tours.all()
        return context

class DestinoCreateView(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    model = Destino
    form_class = DestinoForm
    success_url = reverse_lazy('destino-list')
    success_message = "El destino %(name)s fue creado exitosamente."

class DestinoUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Destino
    form_class = DestinoForm
    success_url = reverse_lazy('destino-list')
    success_message = "El destino %(name)s fue actualizado exitosamente."

class DestinoDeleteView(LoginRequiredMixin, DeleteView):
    model = Destino
    success_url = reverse_lazy('destino-list')

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        messages.success(self.request, f"El destino {obj.name} fue eliminado.")
        return super().delete(request, *args, **kwargs)

class TourListView(ListView):
    model = Tour

class TourDetailView(DetailView):
    model = Tour

class TourCreateView(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    model = Tour
    form_class = TourForm
    success_url = reverse_lazy('tour-list')
    success_message = "El tour %(name)s fue creado exitosamente."

class TourUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Tour
    form_class = TourForm
    success_url = reverse_lazy('tour-list')
    success_message = "El tour %(name)s fue actualizado exitosamente."

class TourDeleteView(LoginRequiredMixin, DeleteView):
    model = Tour
    success_url = reverse_lazy('tour-list')

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        messages.success(self.request, f"El tour {obj.name} fue eliminado.")
        return super().delete(request, *args, **kwargs)

class ReservaListView(ListView):
    model = Reserva

class ReservaCreateView(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    model = Reserva
    form_class = ReservaForm
    success_url = reverse_lazy('reserva-list')
    success_message = "¡Reserva realizada con éxito!"

    def get_initial(self):
        initial = super().get_initial()
        tour_id = self.request.GET.get('tour')
        if tour_id:
            initial['tour'] = tour_id
        return initial

class ReservaUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Reserva
    form_class = ReservaForm
    success_url = reverse_lazy('reserva-list')
    success_message = "Reserva actualizada con éxito."

class ReservaDeleteView(LoginRequiredMixin, DeleteView):
    model = Reserva
    success_url = reverse_lazy('reserva-list')

    def delete(self, request, *args, **kwargs):
        obj = self.get_object()
        messages.success(self.request, f"La reserva de {obj.customer_name} fue eliminada.")
        return super().delete(request, *args, **kwargs)

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
