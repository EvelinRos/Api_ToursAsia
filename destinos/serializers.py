from rest_framework import serializers
from django.utils import timezone
from .models import Destino, Tour, Reserva

class DestinoSerializer(serializers.ModelSerializer):
    """Simple serializer for destinations."""
    class Meta:
        model = Destino
        fields = '__all__'

class TourReadSerializer(serializers.ModelSerializer):
    """Read-only serializer for Tours with nested Destino."""
    destino = DestinoSerializer(read_only=True)

    class Meta:
        model = Tour
        fields = '__all__'

class TourWriteSerializer(serializers.ModelSerializer):
    """Write serializer for Tours with Destino ID."""
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
    """Read-only serializer for Reservas with nested Tour."""
    tour = TourReadSerializer(read_only=True)

    class Meta:
        model = Reserva
        fields = '__all__'

class ReservaWriteSerializer(serializers.ModelSerializer):
    """Write serializer for Reservas with Tour ID."""
    class Meta:
        model = Reserva
        fields = '__all__'

    def validate_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("La fecha no puede ser en el pasado.")
        return value

    def validate_people_count(self, value):
        if value < 1:
            raise serializers.ValidationError("Debe haber al menos 1 persona.")
        return value
