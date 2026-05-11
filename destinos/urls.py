from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Destinos
    path('', views.DestinoListView.as_view(), name='home'),
    path('destinos/', views.DestinoListView.as_view(), name='destino-list'),
    path('destinos/<int:pk>/', views.DestinoDetailView.as_view(), name='destino-detail'),
    path('destinos/nuevo/', views.DestinoCreateView.as_view(), name='destino-create'),
    path('destinos/<int:pk>/editar/', views.DestinoUpdateView.as_view(), name='destino-update'),
    path('destinos/<int:pk>/eliminar/', views.DestinoDeleteView.as_view(), name='destino-delete'),
    
    # Tours
    path('tours/', views.TourListView.as_view(), name='tour-list'),
    path('tours/<int:pk>/', views.TourDetailView.as_view(), name='tour-detail'),
    path('tours/nuevo/', views.TourCreateView.as_view(), name='tour-create'),
    path('tours/<int:pk>/editar/', views.TourUpdateView.as_view(), name='tour-update'),
    path('tours/<int:pk>/eliminar/', views.TourDeleteView.as_view(), name='tour-delete'),
    
    # Reservas
    path('reservas/', views.ReservaListView.as_view(), name='reserva-list'),
    path('reservas/nueva/', views.ReservaCreateView.as_view(), name='reserva-create'),
    path('reservas/<int:pk>/editar/', views.ReservaUpdateView.as_view(), name='reserva-update'),
    path('reservas/<int:pk>/cancelar/', views.ReservaDeleteView.as_view(), name='reserva-delete'),

    # Autenticación
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
]
