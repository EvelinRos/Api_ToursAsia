from rest_framework import serializers
from django.utils import timezone
from .models import Destino, Tour, Reserva

class DestinoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destino
        fields = '__all__'

class TourReadSerializer(serializers.ModelSerializer):
    destino = DestinoSerializer(read_only=True)
    class Meta:
        model = Tour
        fields = '__all__'

class TourWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tour
        fields = '__all__'

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que cero.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("La duración debe ser al menos 1 día.")
        return value

class ReservaReadSerializer(serializers.ModelSerializer):
    tour = TourReadSerializer(read_only=True)
    class Meta:
        model = Reserva
        fields = '__all__'

class ReservaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = '__all__'
        read_only_fields = ['status', 'total_amount', 'created_at', 'updated_at', 'user']

    def validate_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("La fecha no puede ser en el pasado.")
        return value

    def validate_adults(self, value):
        if value < 1:
            raise serializers.ValidationError("Debe haber al menos 1 adulto.")
        return value
    
class ReservaStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['status']

    def validate_status(self, value):
        if value not in ['pendiente', 'confirmada', 'rechazada', 'cancelada']:
            raise serializers.ValidationError("Estado inválido.")
        return value
