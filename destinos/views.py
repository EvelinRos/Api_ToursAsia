from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly,
)

from .models import Destino, Tour, Reserva, ReservaHistorial
from .serializers import (
    DestinoSerializer,
    TourReadSerializer, TourWriteSerializer,
    ReservaReadSerializer, ReservaWriteSerializer, ReservaStatusSerializer,
)

Usuario = get_user_model()


class DestinoViewSet(viewsets.ModelViewSet):
    queryset         = Destino.objects.all()
    serializer_class = DestinoSerializer
    search_fields    = ['name', 'country']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]


class TourViewSet(viewsets.ModelViewSet):
    queryset         = Tour.objects.select_related('destino').all()
    filterset_fields = ['destino', 'is_popular']
    search_fields    = ['name']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return TourReadSerializer
        return TourWriteSerializer

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def toggle_popular(self, request, pk=None):
        """Alterna el campo is_popular del tour."""
        tour = self.get_object()
        tour.is_popular = not tour.is_popular
        tour.save(update_fields=['is_popular'])
        return Response({'id': tour.pk, 'is_popular': tour.is_popular})


class ReservaViewSet(viewsets.ModelViewSet):
    filterset_fields = ['status']

    def get_permissions(self):
        if self.action in ('create', 'list', 'retrieve', 'destroy', 'update', 'partial_update'):
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'cambiar_estado':
            return ReservaStatusSerializer
        if self.action in ('list', 'retrieve'):
            return ReservaReadSerializer
        return ReservaWriteSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Reserva.objects.select_related(
            'tour', 'tour__destino', 'user'
        ).prefetch_related('historial', 'historial__realizada_por')

        if user.is_staff:
            return qs.all()
        return qs.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        tour = serializer.validated_data['tour']
        adults   = serializer.validated_data.get('adults', 1)
        children = serializer.validated_data.get('children', 0)
        total    = (adults * tour.price) + (children * (tour.price * Decimal('0.5')))

        reserva = serializer.save(
            user=user,
            customer_name=serializer.validated_data.get('customer_name') or user.first_name,
            customer_lastname=serializer.validated_data.get('customer_lastname') or user.last_name,
            customer_email=serializer.validated_data.get('customer_email') or user.email,
            customer_phone=serializer.validated_data.get('customer_phone', '') or getattr(user, 'phone', ''),
            status='pendiente',
            total_amount=total,
        )
        # Registrar evento inicial en el historial
        ReservaHistorial.objects.create(
            reserva=reserva,
            accion='creada',
            realizada_por=user,
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def cambiar_estado(self, request, pk=None):
        """
        Cambia el estado de una reserva y registra el evento en el historial.
        Body: { "status": "confirmada|rechazada|cancelada", "nota": "..." }
        """
        reserva    = self.get_object()
        serializer = ReservaStatusSerializer(reserva, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        nuevo_estado = serializer.validated_data['status']
        nota         = serializer.validated_data.get('nota', '')

        reserva.status = nuevo_estado
        reserva.save(update_fields=['status', 'updated_at'])

        ReservaHistorial.objects.create(
            reserva=reserva,
            accion=nuevo_estado,
            realizada_por=request.user,
            nota=nota,
        )

        return Response(ReservaReadSerializer(reserva).data)
