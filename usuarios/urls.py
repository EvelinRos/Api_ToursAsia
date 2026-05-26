from django.urls import path
from .views import (
    DashboardView,
    DashboardDestinosView, DashboardDestinoCreateView, DashboardDestinoUpdateView, DashboardDestinoDeleteView,
    DashboardToursView, DashboardTourCreateView, DashboardTourUpdateView, DashboardTourDeleteView,
    DashboardReservasView, DashboardReservaDetalleView, DashboardUsuariosView,
    ActualizarEstadoReservaView, TogglePopularTourView
)

urlpatterns = [
    # Dashboard web
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('dashboard/destinos/', DashboardDestinosView.as_view(), name='dashboard-destinos'),
    path('dashboard/destinos/nuevo/', DashboardDestinoCreateView.as_view(), name='dashboard-destino-create'),
    path('dashboard/destinos/<int:pk>/editar/', DashboardDestinoUpdateView.as_view(), name='dashboard-destino-update'),
    path('dashboard/destinos/<int:pk>/eliminar/', DashboardDestinoDeleteView.as_view(), name='dashboard-destino-delete'),
    path('dashboard/tours/', DashboardToursView.as_view(), name='dashboard-tours'),
    path('dashboard/tours/nuevo/', DashboardTourCreateView.as_view(), name='dashboard-tour-create'),
    path('dashboard/tours/<int:pk>/editar/', DashboardTourUpdateView.as_view(), name='dashboard-tour-update'),
    path('dashboard/tours/<int:pk>/eliminar/', DashboardTourDeleteView.as_view(), name='dashboard-tour-delete'),
    path('dashboard/reservas/', DashboardReservasView.as_view(), name='dashboard-reservas'),
    path('dashboard/reservas/<int:pk>/', DashboardReservaDetalleView.as_view(), name='dashboard-reserva-detalle'),
    path('dashboard/usuarios/', DashboardUsuariosView.as_view(), name='dashboard-usuarios'),
    # Utilidades dashboard
    path('dashboard/reservas/actualizar-estado/', ActualizarEstadoReservaView.as_view(), name='dashboard-reserva-actualizar-estado'),
    path('dashboard/tours/toggle-popular/', TogglePopularTourView.as_view(), name='toggle-popular'),
]
