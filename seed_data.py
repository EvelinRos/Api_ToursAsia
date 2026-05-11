import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tours_asia.settings')
django.setup()

from destinos.models import Destino, Tour, Reserva
from django.core.files.base import ContentFile
from datetime import date, timedelta

def populate():
    print("Poblando la base de datos...")

    # Crear Destinos
    destinos_data = [
        {
            "name": "Tokio",
            "country": "Japón",
            "description": "Una mezcla fascinante de templos antiguos y rascacielos futuristas."
        },
        {
            "name": "Bali",
            "country": "Indonesia",
            "description": "Paraíso tropical conocido por sus montañas volcánicas, campos de arroz y arrecifes de coral."
        },
        {
            "name": "Seúl",
            "country": "Corea del Sur",
            "description": "La capital tecnológica donde la tradición se encuentra con el K-Pop."
        }
    ]

    for d_data in destinos_data:
        destino, created = Destino.objects.get_or_create(
            name=d_data["name"],
            defaults={"country": d_data["country"], "description": d_data["description"]}
        )
        if created:
            print(f"Creado destino: {destino.name}")

            # Crear algunos tours para cada destino
            if destino.name == "Tokio":
                tour = Tour.objects.create(
                    destino=destino,
                    name="Templos y Tradición",
                    duration=5,
                    price=1200.00,
                    description="Visita los templos de Asakusa y el cruce de Shibuya."
                )
            elif destino.name == "Bali":
                tour = Tour.objects.create(
                    destino=destino,
                    name="Aventura en la Selva",
                    duration=7,
                    price=850.00,
                    description="Explora los arrozales de Ubud y playas paradisíacas."
                )
            elif destino.name == "Seúl":
                tour = Tour.objects.create(
                    destino=destino,
                    name="Moda y Tecnología",
                    duration=4,
                    price=950.00,
                    description="Compras en Myeongdong y visita a la Torre N Seoul."
                )
            
            # Crear una reserva de prueba para cada tour creado
            Reserva.objects.create(
                tour=tour,
                customer_name=f"Cliente de prueba {destino.name}",
                customer_email=f"test_{destino.name.lower()}@example.com",
                date=date.today() + timedelta(days=30),
                people_count=2,
                notes="Reserva generada automáticamente por el seed."
            )
            print(f"Creada reserva de prueba para {tour.name}")

    print("¡Base de datos poblada con éxito!")

if __name__ == '__main__':
    populate()
