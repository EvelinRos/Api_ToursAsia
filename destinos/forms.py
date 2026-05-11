from django import forms
from django.utils import timezone
from destinos.models import Destino, Tour, Reserva

class DestinoForm(forms.ModelForm):
    class Meta:
        model = Destino
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Ej. Kioto Imperial'}),
            'country': forms.TextInput(attrs={'placeholder': 'Ej. Japón'}),
            'description': forms.Textarea(attrs={'placeholder': 'Describe brevemente el destino...', 'rows': 4}),
        }

class TourForm(forms.ModelForm):
    class Meta:
        model = Tour
        fields = '__all__'
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Ej. Tour Templos y Jardines'}),
            'duration': forms.NumberInput(attrs={'placeholder': 'Número de días'}),
            'price': forms.NumberInput(attrs={'placeholder': 'Precio en USD'}),
            'description': forms.Textarea(attrs={'placeholder': 'Describe los detalles del tour...', 'rows': 4}),
        }

    def clean(self):
        cleaned_data = super().clean()
        price = cleaned_data.get('price')
        duration = cleaned_data.get('duration')
        
        if price is not None and price <= 0:
            self.add_error('price', 'El precio debe ser mayor que cero.')
        
        if duration is not None and duration <= 0:
            self.add_error('duration', 'La duración debe ser al menos 1 día.')
            
        return cleaned_data

class ReservaForm(forms.ModelForm):
    class Meta:
        model = Reserva
        fields = ['tour', 'customer_name', 'customer_email', 'date', 'people_count', 'notes', 'status']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'customer_name': forms.TextInput(attrs={'placeholder': 'Tu nombre completo'}),
            'customer_email': forms.EmailInput(attrs={'placeholder': 'tu@email.com'}),
            'notes': forms.Textarea(attrs={'placeholder': 'Alguna observación...', 'rows': 3}),
        }

    def clean(self):
        cleaned_data = super().clean()
        date = cleaned_data.get('date')
        people_count = cleaned_data.get('people_count')
        
        if date and date < timezone.now().date():
            self.add_error('date', 'La fecha no puede ser en el pasado.')
            
        if people_count is not None and people_count < 1:
            self.add_error('people_count', 'Debe haber al menos 1 persona.')
            
        return cleaned_data
