from rest_framework import viewsets, status
from decimal import Decimal
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, IsAuthenticatedOrReadOnly

from .models import Destino, Tour, Reserva
from .serializers import (
    DestinoSerializer, TourReadSerializer, TourWriteSerializer,
    ReservaReadSerializer, ReservaWriteSerializer, ReservaStatusSerializer
)

class DestinoViewSet(viewsets.ModelViewSet):
    queryset = Destino.objects.all()
    serializer_class = DestinoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['name', 'country']


class TourViewSet(viewsets.ModelViewSet):
    queryset = Tour.objects.select_related('destino').all()
    filterset_fields = ['destino']
    search_fields = ['name']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticatedOrReadOnly()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return TourReadSerializer
        return TourWriteSerializer


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
        if user.is_staff:
            return Reserva.objects.select_related('tour', 'tour__destino', 'user').all()
        return Reserva.objects.filter(user=user).select_related('tour', 'tour__destino')

    def perform_create(self, serializer):
        user = self.request.user
        tour = serializer.validated_data['tour']
        adults = serializer.validated_data.get('adults', 1)
        children = serializer.validated_data.get('children', 0)
        total = (adults * tour.price) + (children * (tour.price * Decimal('0.5')))
        serializer.save(
            user=user,
            customer_name=serializer.validated_data.get('customer_name') or user.first_name,
            customer_lastname=serializer.validated_data.get('customer_lastname') or user.last_name,
            customer_email=serializer.validated_data.get('customer_email') or user.email,
            customer_phone=serializer.validated_data.get('customer_phone', '') or getattr(user, 'phone', ''),
            status='pendiente',
            total_amount=total,
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def cambiar_estado(self, request, pk=None):
        reserva = self.get_object()
        serializer = ReservaStatusSerializer(reserva, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ReservaReadSerializer(reserva).data)
