from django.contrib import admin
from .models import Destino, Tour, Reserva

@admin.register(Destino)
class DestinoAdmin(admin.ModelAdmin):
    list_display  = ('name', 'country', 'pub_date')
    search_fields = ('name', 'country')
    list_filter   = ('country',)

@admin.register(Tour)
class TourAdmin(admin.ModelAdmin):
    list_display  = ('name', 'destino', 'price', 'duration', 'pub_date')
    search_fields = ('name', 'destino__name')
    list_filter   = ('destino',)
    ordering      = ('-pub_date',)

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display    = ('customer_name', 'tour', 'date', 'people_count', 'status', 'created_at')
    search_fields   = ('customer_name', 'customer_email')
    list_filter     = ('status', 'tour__destino')
    ordering        = ('-created_at',)
    readonly_fields = ('created_at',)
