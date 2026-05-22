import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToursService } from '../../core/services/tours.service';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { Tour } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-reserva',
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './reserva.html',
})
export class ReservaComponent implements OnInit {
  paso = signal(1);
  tour = signal<Tour | null>(null);
  cargando = signal(false);
  reservaCreada = signal<number | null>(null);

  // Paso 1 — selección
  seleccion = {
    fecha: '',
    hora: '',
    adultos: 1,
    ninos: 0,
    bebes: 0,
    idioma: 'Español',
  };

  // Paso 2 — datos personales
  datosPersonales = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    pais: 'Colombia',
    comentarios: '',
    aceptaTerminos: false,
  };

  totalPersonas = computed(() =>
    this.seleccion.adultos + this.seleccion.ninos + this.seleccion.bebes
  );

  totalPrecio = computed(() => {
    const t = this.tour();
    if (!t) return 0;
    return (this.seleccion.adultos + this.seleccion.ninos) * t.price;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toursService: ToursService,
    private reservasService: ReservasService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const tourId = +this.route.snapshot.paramMap.get('tourId')!;
    this.toursService.getTour(tourId).subscribe(t => {
      this.tour.set(t);
      // Pre-llenar datos si el usuario está logueado
      const u = this.auth.usuario();
      if (u) {
        this.datosPersonales.nombre = u.first_name;
        this.datosPersonales.apellido = u.last_name;
        this.datosPersonales.email = u.email;
      }
    });
  }

  irPaso2() {
    if (!this.seleccion.fecha) { alert('Selecciona una fecha'); return; }
    if (!this.seleccion.hora) { alert('Selecciona un horario'); return; }
    if (this.totalPersonas() === 0) { alert('Agrega al menos 1 persona'); return; }
    this.paso.set(2);
  }

  irPaso3() {
    if (!this.datosPersonales.aceptaTerminos) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    this.paso.set(3);
  }

  confirmar() {
    const t = this.tour();
    if (!t) return;
    this.cargando.set(true);
    const payload = {
      tour: t.id,
      date: this.seleccion.fecha,
      time_slot: this.seleccion.hora,
      adults: this.seleccion.adultos,
      children: this.seleccion.ninos,
      language: this.seleccion.idioma,
      customer_name: this.datosPersonales.nombre,
      customer_lastname: this.datosPersonales.apellido,
      customer_email: this.datosPersonales.email,
      customer_phone: this.datosPersonales.telefono,
      customer_country: this.datosPersonales.pais,
      notes: this.datosPersonales.comentarios,
      total_amount: this.totalPrecio(),
      subtotal: this.totalPrecio(),
    };
    this.reservasService.crear(payload).subscribe({
      next: (r) => {
        this.reservaCreada.set(r.id);
        this.paso.set(4); // pantalla de confirmación
        this.cargando.set(false);
      },
      error: () => {
        alert('Error al crear la reserva. Intenta nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  cambiar(campo: 'adultos' | 'ninos' | 'bebes', delta: number) {
    const nuevo = this.seleccion[campo] + delta;
    if (nuevo >= 0) this.seleccion[campo] = nuevo;
  }

  hoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}