from django.urls import path
from .views import (
    HomeView, DestinoListView, DestinoDetailView, TourListView, TourDetailView,
    CheckoutPaso1View, CheckoutPaso2View, CheckoutPaso3View, ReservaConfirmadaView
)

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('destinos/', DestinoListView.as_view(), name='destino-list'),
    path('destinos/<int:pk>/', DestinoDetailView.as_view(), name='destino-detail'),
    path('tours/', TourListView.as_view(), name='tour-list'),
    path('tours/<int:pk>/', TourDetailView.as_view(), name='tour-detail'),
    path('checkout/paso1/', CheckoutPaso1View.as_view(), name='checkout-paso1'),
    path('checkout/paso2/', CheckoutPaso2View.as_view(), name='checkout-paso2'),
    path('checkout/paso3/', CheckoutPaso3View.as_view(), name='checkout-paso3'),
    path('reserva-confirmada/<int:pk>/', ReservaConfirmadaView.as_view(), name='reserva-confirmada'),
]
