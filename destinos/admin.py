from django.contrib import admin
from .models import Destino, Tour, Reserva, ReservaHistorial


@admin.register(Destino)
class DestinoAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'country', 'pub_date']
    search_fields = ['name', 'country']
    list_filter   = ['country']


@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display        = ['id', 'name', 'destino', 'duration', 'price', 'is_popular', 'pub_date']
    search_fields       = ['name']
    list_filter         = ['destino', 'is_popular']
    list_select_related = ['destino']


class ReservaHistorialInline(admin.TabularInline):
    model           = ReservaHistorial
    extra           = 0
    readonly_fields = ['accion', 'realizada_por', 'nota', 'created_at']
    can_delete      = False


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display        = ['id', 'customer_name', 'tour', 'date', 'adults', 'children', 'status', 'created_at']
    search_fields       = ['customer_name', 'customer_email']
    list_filter         = ['status', 'tour']
    list_select_related = ['tour']
    inlines             = [ReservaHistorialInline]


@admin.register(ReservaHistorial)
class ReservaHistorialAdmin(admin.ModelAdmin):
    list_display  = ['id', 'reserva', 'accion', 'realizada_por', 'created_at']
    list_filter   = ['accion']
    search_fields = ['reserva__customer_name', 'reserva__customer_email']
