import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tours_asia.settings')
django.setup()

from django.contrib.auth.models import User

# Eliminar el usuario admin
user = User.objects.filter(username='admin').delete()

print("Usuario 'admin' eliminado correctamente.")
