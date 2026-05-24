from rest_framework import serializers
from django.utils import timezone
from .models import Destino, Tour, Reserva, ReservaHistorial


# ── Destino ────────────────────────────────────────────────────────────────

class DestinoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Destino
        fields = '__all__'


# ── Tour ───────────────────────────────────────────────────────────────────

class TourReadSerializer(serializers.ModelSerializer):
    destino = DestinoSerializer(read_only=True)

    class Meta:
        model  = Tour
        fields = '__all__'


class TourWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Tour
        fields = '__all__'

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que cero.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("La duración debe ser al menos 1 día.")
        return value


# ── Historial ──────────────────────────────────────────────────────────────

class ReservaHistorialSerializer(serializers.ModelSerializer):
    realizada_por_email = serializers.SerializerMethodField()

    class Meta:
        model  = ReservaHistorial
        fields = ['id', 'accion', 'realizada_por_email', 'nota', 'created_at']

    def get_realizada_por_email(self, obj) -> str:
        if obj.realizada_por:
            return obj.realizada_por.email
        return 'Sistema'


# ── Reserva ────────────────────────────────────────────────────────────────

class ReservaReadSerializer(serializers.ModelSerializer):
    tour      = TourReadSerializer(read_only=True)
    historial = ReservaHistorialSerializer(many=True, read_only=True)

    class Meta:
        model  = Reserva
        fields = '__all__'


class ReservaWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Reserva
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
    nota = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model  = Reserva
        fields = ['status', 'nota']

    def validate_status(self, value):
        allowed = ['confirmada', 'rechazada', 'cancelada']
        if value not in allowed:
            raise serializers.ValidationError(
                f"Estado inválido. Opciones permitidas: {allowed}"
            )
        return value


# ── Usuario (solo lectura, para panel admin) ───────────────────────────────

class UsuarioAdminSerializer(serializers.Serializer):
    """Serializer de solo lectura para listar usuarios en el panel admin."""
    id             = serializers.IntegerField()
    email          = serializers.EmailField()
    first_name     = serializers.CharField()
    last_name      = serializers.CharField()
    phone          = serializers.CharField()
    country        = serializers.CharField()
    is_staff       = serializers.BooleanField()
    is_active      = serializers.BooleanField()
    created_at     = serializers.DateTimeField()
    reservas_count = serializers.SerializerMethodField()

    def get_reservas_count(self, obj) -> int:
        return obj.reservas.count()
