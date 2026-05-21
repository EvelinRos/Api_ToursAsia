from django.urls import path
from .views import (
    ClienteLoginView, ClienteLogoutView, ClienteRegistroView,
    MisReservasView, MiReservaDetalleView,
    AdminLoginView, AdminLogoutView, DashboardView,
    DashboardDestinosView, DashboardDestinoCreateView, DashboardDestinoUpdateView, DashboardDestinoDeleteView,
    DashboardToursView, DashboardTourCreateView, DashboardTourUpdateView, DashboardTourDeleteView,
    DashboardReservasView, DashboardReservaDetalleView, DashboardUsuariosView,
    VerificarEmailView, AplicarCuponView, ActualizarEstadoReservaView, TogglePopularTourView
)

urlpatterns = [
    # Clientes
    path('login/', ClienteLoginView.as_view(), name='cliente-login'),
    path('logout/', ClienteLogoutView.as_view(), name='cliente-logout'),
    path('registro/', ClienteRegistroView.as_view(), name='cliente-registro'),
    path('mis-reservas/', MisReservasView.as_view(), name='mis-reservas'),
    path('mis-reservas/<int:pk>/', MiReservaDetalleView.as_view(), name='mi-reserva-detalle'),
    
    # Admin
    path('admin-login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin-logout/', AdminLogoutView.as_view(), name='admin-logout'),
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
    
    # AJAX endpoints
    path('api/verificar-email/', VerificarEmailView.as_view(), name='verificar-email'),
    path('api/aplicar-cupon/', AplicarCuponView.as_view(), name='aplicar-cupon'),
    path('api/actualizar-estado-reserva/', ActualizarEstadoReservaView.as_view(), name='actualizar-estado-reserva'),
    path('api/toggle-popular-tour/', TogglePopularTourView.as_view(), name='toggle-popular'),
]
