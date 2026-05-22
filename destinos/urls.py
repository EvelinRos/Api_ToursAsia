from django.urls import path
from .views import (
    HomeView, DestinoListView, DestinoDetailView, TourListView, TourDetailView,
    ReservaView, ReservaConfirmadaView
)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('destinos/', DestinoListView.as_view(), name='destino-list'),
    path('destinos/<int:pk>/', DestinoDetailView.as_view(), name='destino-detail'),
    path('tours/', TourListView.as_view(), name='tour-list'),
    path('tours/<int:pk>/', TourDetailView.as_view(), name='tour-detail'),
    path('reserva/', ReservaView.as_view(), name='reserva'),
    path('reserva-confirmada/<int:pk>/', ReservaConfirmadaView.as_view(), name='reserva-confirmada'),
]
