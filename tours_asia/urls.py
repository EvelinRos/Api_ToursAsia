from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from destinos.views import DestinoViewSet, TourViewSet, ReservaViewSet

# API Router configuration
router = DefaultRouter()
router.register(r'destinos', DestinoViewSet, basename='destino')
router.register(r'tours', TourViewSet, basename='tour')
router.register(r'reservas', ReservaViewSet, basename='reserva')

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/', include(router.urls)),
    # Web views
    path('', include('destinos.urls')),
]

# Fix: Using static() helper for media serving in DEBUG mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
