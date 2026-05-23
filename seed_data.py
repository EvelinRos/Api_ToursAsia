import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'tours_asia.settings')
django.setup()

from destinos.models import Destino, Tour
from decimal import Decimal

def run():
    print("Limpiando base de datos...")
    Tour.objects.all().delete()
    Destino.objects.all().delete()

    print("Creando destinos...")
    destinos_data = [
        {
            'name': 'Tokio',
            'country': 'Japón',
            'description': 'La ciudad del futuro que nunca duerme...',
            'cover_url': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
            'fun_fact': '¿Sabías que Tokio tiene más estrellas Michelin que cualquier otra ciudad del mundo?',
            'best_time': 'Marzo-Mayo (cerezos) y Oct-Nov (otoño)',
            'language': 'Japonés',
            'currency': 'Yen (¥)',
            'highlights': ['Monte Fuji', 'Templo Senso-ji', 'Shibuya', 'Akihabara', 'Harajuku'],
        },
        {
            'name': 'Pekín',
            'country': 'China',
            'description': 'Donde la historia milenaria se encuentra con el futuro...',
            'cover_url': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
            'fun_fact': 'La Ciudad Prohibida tiene exactamente 9,999 habitaciones, pues el número 10,000 era reservado para el cielo.',
            'best_time': 'Abril-Mayo y Sept-Oct',
            'language': 'Mandarín',
            'currency': 'Yuan (¥)',
            'highlights': ['La Gran Muralla', 'Ciudad Prohibida', 'Templo del Cielo', 'Hutongs', 'Palacio de Verano'],
        },
        {
            'name': 'Bangkok',
            'country': 'Tailandia',
            'description': 'Una vibrante metrópolis llena de templos dorados y mercados flotantes.',
            'fun_fact': 'Bangkok tiene el nombre oficial más largo del mundo: "Krung Thep Maha Nakhon..." — 163 letras en total.',
            'cover_url': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
            'best_time': 'Noviembre-Febrero',
            'language': 'Tailandés',
            'currency': 'Baht (฿)',
            'highlights': ['Gran Palacio', 'Wat Pho', 'Khaosan Road', 'Mercado Flotante', 'Ayutthaya'],
        },
        {
            'name': 'Bali',
            'country': 'Indonesia',
            'description': 'La isla de los dioses, famosa por sus playas y templos sagrados.',
            'fun_fact': 'En Bali existen más de 20,000 templos. Los balineses realizan hasta 3 ceremonias religiosas por día.',
            'cover_url': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
            'best_time': 'Mayo-Septiembre',
            'language': 'Indonesio / Balinés',
            'currency': 'Rupia (Rp)',
            'highlights': ['Ubud', 'Templo Uluwatu', 'Terrazas de Arroz', 'Nusa Penida', 'Seminyak'],
        },
        {
            'name': 'Hanói',
            'country': 'Vietnam',
            'description': 'La capital de los mil años, mezcla de herencia asiática y francesa.',
            'fun_fact': 'Hanói tiene más de 1,000 años de historia y su casco antiguo tiene calles nombradas por el gremio que las habitaba.',
            'cover_url': 'https://images.unsplash.com/photo-1509030450996-dd1a26dda07a',
            'best_time': 'Octubre-Diciembre',
            'language': 'Vietnamita',
            'currency': 'Dong (₫)',
            'highlights': ['Bahía de Ha Long', 'Casco Antiguo', 'Lago Hoan Kiem', 'Templo de la Literatura'],
        },
        {
            'name': 'Seúl',
            'country': 'Corea del Sur',
            'description': 'Tradición y tecnología de vanguardia conviven en perfecta armonía.',
            'fun_fact': 'Seúl tiene la internet más rápida del mundo y más cafeterías per cápita que ninguna otra ciudad asiática.',
            'cover_url': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451',
            'best_time': 'Primavera y Otoño',
            'language': 'Coreano',
            'currency': 'Won (₩)',
            'highlights': ['Palacio Gyeongbokgung', 'Bukchon Hanok Village', 'N Seoul Tower', 'Myeongdong'],
        },
        {
            'name': 'Kioto',
            'country': 'Japón',
            'description': 'El corazón tradicional de Japón, lleno de templos y santuarios.',
            'fun_fact': 'Kioto fue capital de Japón por más de 1,000 años y tiene 17 sitios declarados Patrimonio de la Humanidad.',
            'cover_url': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
            'best_time': 'Primavera y Otoño',
            'language': 'Japonés',
            'currency': 'Yen (¥)',
            'highlights': ['Fushimi Inari', 'Kinkaku-ji', 'Arashiyama', 'Gion'],
        },
        {
            'name': 'Shanghái',
            'country': 'China',
            'description': 'La ciudad más grande de China y su centro financiero global.',
            'fun_fact': 'El puerto de Shanghái es el más transitado del mundo. Su skyline creció de 3 rascacielos en 1990 a más de 3,000 hoy.',
            'cover_url': 'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403',
            'best_time': 'Septiembre-Noviembre',
            'language': 'Mandarín',
            'currency': 'Yuan (¥)',
            'highlights': ['The Bund', 'Jardín Yuyuan', 'Oriental Pearl Tower', 'Nanjing Road'],
        }
    ]

    destinos_db = {}
    for d_data in destinos_data:
        dest = Destino.objects.create(**d_data)
        destinos_db[dest.name] = dest

    print("Creando tours...")
    tours_data = [
        {
            'destino': destinos_db['Tokio'],
            'name': 'Tokio: Tour de los Templos y Modernidad',
            'duration': 5,
            'price': Decimal('850.00'),
            'photo_url': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
            'description': 'Descubre la dualidad de Tokio, desde los antiguos templos hasta las iluminadas calles de Akihabara.',
            'what_includes': ['Guía certificado', 'Transporte privado', 'Entradas monumentos'],
            'what_not_includes': ['Propinas', 'Seguro de viaje', 'Comidas no especificadas'],
            'meeting_point': 'Estación Central de Tokio, Salida Marunouchi Norte',
            'time_slots': ['09:00 AM', '02:00 PM'],
            'is_popular': True,
            'rating': Decimal('4.9'),
            'reviews_count': 127
        },
        {
            'destino': destinos_db['Tokio'],
            'name': 'Monte Fuji y Hakone en un día',
            'duration': 1,
            'price': Decimal('150.00'),
            'photo_url': 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65',
            'description': 'Visita el icónico Monte Fuji y disfruta de un crucero por el lago Ashi en Hakone.',
            'what_includes': ['Guía certificado', 'Transporte ida y vuelta', 'Paseo en barco'],
            'what_not_includes': ['Comidas', 'Seguro'],
            'meeting_point': 'Shinjuku Center Building',
            'time_slots': ['08:00 AM'],
            'is_popular': True,
            'rating': Decimal('4.8'),
            'reviews_count': 342
        },
        {
            'destino': destinos_db['Pekín'],
            'name': 'La Gran Muralla: Sección Mutianyu',
            'duration': 1,
            'price': Decimal('95.00'),
            'photo_url': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d',
            'description': 'Camina por una de las secciones mejor conservadas y menos concurridas de la Gran Muralla China.',
            'what_includes': ['Guía en español', 'Transporte', 'Entrada a la muralla', 'Teleférico'],
            'what_not_includes': ['Comidas', 'Propinas'],
            'meeting_point': 'Hotel en el centro de Pekín',
            'time_slots': ['07:30 AM'],
            'is_popular': True,
            'rating': Decimal('4.9'),
            'reviews_count': 215
        },
        {
            'destino': destinos_db['Bangkok'],
            'name': 'Templos de Bangkok y Gran Palacio',
            'duration': 1,
            'price': Decimal('55.00'),
            'photo_url': 'https://images.unsplash.com/photo-1563492065599-3520f775eeed',
            'description': 'Recorre los templos más importantes de la ciudad y el majestuoso Gran Palacio Real.',
            'what_includes': ['Guía local', 'Entradas', 'Transporte en minivan'],
            'what_not_includes': ['Comidas', 'Propinas'],
            'meeting_point': 'Punto céntrico Khaosan',
            'time_slots': ['08:00 AM', '01:00 PM'],
            'is_popular': False,
            'rating': Decimal('4.7'),
            'reviews_count': 89
        },
        {
            'destino': destinos_db['Bali'],
            'name': 'Bali: Ubud, Terrazas de Arroz y Volcán',
            'duration': 2,
            'price': Decimal('120.00'),
            'photo_url': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2',
            'description': 'Sumérgete en la cultura balinesa visitando Ubud, las famosas terrazas de arroz y el monte Batur.',
            'what_includes': ['Guía local', 'Transporte privado', 'Entradas', 'Almuerzo tradicional'],
            'what_not_includes': ['Bebidas', 'Propinas'],
            'meeting_point': 'Hotel en el sur de Bali',
            'time_slots': ['08:30 AM'],
            'is_popular': True,
            'rating': Decimal('4.9'),
            'reviews_count': 456
        },
        {
            'destino': destinos_db['Hanói'],
            'name': 'Crucero 2 días por la Bahía de Ha Long',
            'duration': 2,
            'price': Decimal('180.00'),
            'photo_url': 'https://images.unsplash.com/photo-1528127269322-539801943592',
            'description': 'Navega entre miles de islotes de piedra caliza en un crucero de lujo con actividades a bordo.',
            'what_includes': ['Traslados desde Hanói', 'Camarote', 'Todas las comidas', 'Excursiones en kayak'],
            'what_not_includes': ['Bebidas alcohólicas', 'Propinas'],
            'meeting_point': 'Opera House de Hanói',
            'time_slots': ['08:00 AM'],
            'is_popular': True,
            'rating': Decimal('4.8'),
            'reviews_count': 320
        },
        {
            'destino': destinos_db['Kioto'],
            'name': 'Kioto Tradicional: Arashiyama y Kinkaku-ji',
            'duration': 1,
            'price': Decimal('110.00'),
            'photo_url': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
            'description': 'Pasea por el bosque de bambú y admira el Pabellón Dorado en este tour esencial de Kioto.',
            'what_includes': ['Guía en español', 'Entradas', 'Transporte público cubierto'],
            'what_not_includes': ['Comidas', 'Gastos personales'],
            'meeting_point': 'Estación de Kioto',
            'time_slots': ['09:00 AM'],
            'is_popular': False,
            'rating': Decimal('4.9'),
            'reviews_count': 180
        },
        {
            'destino': destinos_db['Seúl'],
            'name': 'Zona Desmilitarizada (DMZ) y JSA',
            'duration': 1,
            'price': Decimal('135.00'),
            'photo_url': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451',
            'description': 'Visita la frontera más vigilada del mundo y conoce la historia entre las dos Coreas.',
            'what_includes': ['Guía experto', 'Transporte', 'Entradas DMZ'],
            'what_not_includes': ['Comidas'],
            'meeting_point': 'Hotel President, Seúl',
            'time_slots': ['07:00 AM'],
            'is_popular': True,
            'rating': Decimal('4.8'),
            'reviews_count': 290
        }
    ]

    for t_data in tours_data:
        Tour.objects.create(**t_data)

    print("Datos semilla creados exitosamente.")

if __name__ == '__main__':
    run()
