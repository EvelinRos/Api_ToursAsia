from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from datetime import date, timedelta
from .models import Destino, Tour
from .serializers import TourWriteSerializer, ReservaWriteSerializer

class ToursAsiaTestCase(TestCase):
    def setUp(self):
        self.destino = Destino.objects.create(
            name="Kioto", 
            country="Japón", 
            description="Antigua capital"
        )
        self.tour = Tour.objects.create(
            destino=self.destino,
            name="Templos Zen",
            duration=3,
            price=500.00,
            description="Visita guiada"
        )

    def test_crear_destino(self):
        """1. Crea un Destino y verifica que __str__ devuelve el nombre."""
        self.assertEqual(str(self.destino), "Kioto")

    def test_tour_precio_negativo(self):
        """2. Verifica que TourWriteSerializer rechaza price=-1."""
        data = {
            'destino': self.destino.id,
            'name': 'Tour Invalido',
            'duration': 5,
            'price': -1.00,
            'description': 'Error'
        }
        serializer = TourWriteSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('price', serializer.errors)

    def test_reserva_fecha_pasada(self):
        """3. Verifica que ReservaWriteSerializer rechaza una fecha anterior a hoy."""
        past_date = date.today() - timedelta(days=1)
        data = {
            'tour': self.tour.id,
            'customer_name': 'Test',
            'customer_email': 'test@test.com',
            'date': past_date,
            'people_count': 2,
            'notes': 'Error'
        }
        serializer = ReservaWriteSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('date', serializer.errors)

    def test_api_destinos_lista(self):
        """4. GET /api/destinos/ devuelve status 200."""
        url = reverse('destino-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_api_tour_detalle_anidado(self):
        """5. GET /api/tours/{id}/ devuelve el campo destino como objeto (no como entero)."""
        url = reverse('tour-detail', kwargs={'pk': self.tour.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verificamos que destino sea un diccionario (objeto) y no un entero (ID)
        self.assertIsInstance(response.data['destino'], dict)
        self.assertEqual(response.data['destino']['name'], "Kioto")
