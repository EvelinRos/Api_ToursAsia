from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Usuario

class RegistroClienteForm(UserCreationForm):
    first_name = forms.CharField(
        label='Nombre',
        widget=forms.TextInput(attrs={'placeholder': 'Tu nombre'})
    )
    last_name = forms.CharField(
        label='Apellido', 
        widget=forms.TextInput(attrs={'placeholder': 'Tu apellido'})
    )
    email = forms.EmailField(
        label='Correo electrónico',
        widget=forms.EmailInput(attrs={'placeholder': 'tu@correo.com'})
    )
    phone = forms.CharField(
        label='Teléfono',
        widget=forms.TextInput(attrs={'placeholder': '+57 300 000 0000'})
    )
    country = forms.CharField(
        label='País',
        widget=forms.TextInput(attrs={'placeholder': 'Colombia'})
    )
    password1 = forms.CharField(
        label='Contraseña',
        widget=forms.PasswordInput(attrs={'placeholder': '••••••••'})
    )
    password2 = forms.CharField(
        label='Confirmar contraseña',
        widget=forms.PasswordInput(attrs={'placeholder': '••••••••'})
    )
    
    class Meta:
        model = Usuario
        fields = ['first_name', 'last_name', 'email', 'phone', 
                  'country', 'password1', 'password2']
    
    def clean_email(self):
        email = self.cleaned_data['email']
        if Usuario.objects.filter(email=email).exists():
            raise forms.ValidationError('Este correo ya está registrado.')
        return email
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = self.cleaned_data['email']
        user.email = self.cleaned_data['email']
        user.is_staff = False
        if commit:
            user.save()
        return user
