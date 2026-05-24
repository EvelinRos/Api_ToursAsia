from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from destinos.views import DestinoViewSet, TourViewSet, ReservaViewSet, UsuarioViewSet
from usuarios.views import CustomTokenView, RegistroAPIView

router = DefaultRouter()
router.register(r'destinos',  DestinoViewSet,  basename='destino')
router.register(r'tours',     TourViewSet,     basename='tour')
router.register(r'reservas',  ReservaViewSet,  basename='reserva')
router.register(r'usuarios',  UsuarioViewSet,  basename='usuario')

urlpatterns = [
    path('admin/',                      admin.site.urls),
    path('api/auth/token/',             CustomTokenView.as_view(),   name='token-obtain'),
    path('api/auth/token/refresh/',     TokenRefreshView.as_view(),  name='token-refresh'),
    path('api/auth/registro/',          RegistroAPIView.as_view(),   name='api-registro'),
    path('api/',                        include(router.urls)),
    path('',                            include('usuarios.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
