from django.contrib import admin
from .models import Destino, Tour, Reserva

@admin.register(Destino)
class DestinoAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'country', 'pub_date']
    search_fields = ['name', 'country']
    list_filter  = ['country']

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display        = ['id', 'name', 'destino', 'duration', 'price', 'pub_date']
    search_fields       = ['name']
    list_filter         = ['destino']
    list_select_related = ['destino']

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display        = ['id', 'customer_name', 'tour', 'date', 'adults', 'children', 'status', 'created_at']
    search_fields       = ['customer_name', 'customer_email']
    list_filter         = ['status', 'tour']
    list_select_related = ['tour']
