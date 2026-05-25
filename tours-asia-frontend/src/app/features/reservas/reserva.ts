import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToursService } from '../../core/services/tours.service';
import { ReservasService, CrearReservaPayload } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { Tour } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent, FooterComponent, RouterLink],
  templateUrl: './reserva.html',
})
export class ReservaComponent implements OnInit {
  paso = signal(1);
  tour = signal<Tour | null>(null);
  cargando = signal(false);
  reservaCreada = signal<number | null>(null);

  // Errores inline (NO alert())
  errorFecha   = signal('');
  errorHora    = signal('');
  errorPersonas = signal('');
  errorTerminos = signal('');

  seleccion = { fecha: '', hora: '', adultos: 1, ninos: 0, bebes: 0, idioma: 'Español' };
  datosPersonales = {
    nombre: '', apellido: '', email: '',
    telefono: '', pais: 'Colombia', comentarios: '', aceptaTerminos: false,
  };

  get totalPersonas() {
    return this.seleccion.adultos + this.seleccion.ninos + this.seleccion.bebes;
  }

  get totalPrecio() {
    const t = this.tour();
    if (!t) return 0;
    return (this.seleccion.adultos * t.price) + (this.seleccion.ninos * t.price * 0.5);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toursService: ToursService,
    private reservasService: ReservasService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const tourId = +this.route.snapshot.paramMap.get('tourId')!;
    this.toursService.getTour(tourId).subscribe({
      next: t => {
        this.tour.set(t);
        const u = this.auth.usuario();
        if (u) {
          this.datosPersonales.nombre   = u.first_name;
          this.datosPersonales.apellido = u.last_name;
          this.datosPersonales.email    = u.email;
        }
      },
      error: () => this.router.navigate(['/tours']),
    });
  }

  irPaso2() {
    this.errorFecha.set('');
    this.errorHora.set('');
    this.errorPersonas.set('');
    if (!this.seleccion.fecha)  { this.errorFecha.set('Selecciona una fecha'); return; }
    if (!this.seleccion.hora)   { this.errorHora.set('Selecciona un horario'); return; }
    if (this.totalPersonas < 1) { this.errorPersonas.set('Agrega al menos 1 persona'); return; }
    this.paso.set(2);
  }

  irPaso3() {
    this.errorTerminos.set('');
    if (!this.datosPersonales.nombre  || !this.datosPersonales.apellido ||
        !this.datosPersonales.email   || !this.datosPersonales.telefono) {
      this.errorTerminos.set('Completa todos los campos obligatorios');
      return;
    }
    if (!this.datosPersonales.aceptaTerminos) {
      this.errorTerminos.set('Debes aceptar los términos y condiciones');
      return;
    }
    this.paso.set(3);
  }

  confirmar() {
    const t = this.tour();
    if (!t) return;
    this.cargando.set(true);

    const payload: CrearReservaPayload = {
      tour:              t.id,
      date:              this.seleccion.fecha,
      time_slot:         this.seleccion.hora,
      adults:            this.seleccion.adultos,
      children:          this.seleccion.ninos,
      language:          this.seleccion.idioma,
      customer_name:     this.datosPersonales.nombre,
      customer_lastname: this.datosPersonales.apellido,
      customer_email:    this.datosPersonales.email,
      customer_phone:    this.datosPersonales.telefono,
      customer_country:  this.datosPersonales.pais,
      notes:             this.datosPersonales.comentarios,
      total_amount:      this.totalPrecio,
    };

    this.reservasService.crear(payload).subscribe({
      next: r => {
        this.reservaCreada.set(r.id);
        this.paso.set(4);           // pantalla de éxito
        this.cargando.set(false);
      },
      error: () => {
        this.errorTerminos.set('Error al crear la reserva. Intenta nuevamente.');
        this.cargando.set(false);
      },
    });
  }

  cambiar(campo: 'adultos' | 'ninos' | 'bebes', delta: number) {
    const nuevo = this.seleccion[campo] + delta;
    if (campo === 'adultos' && nuevo < 1) return;   // mínimo 1 adulto
    if (nuevo >= 0) this.seleccion[campo] = nuevo;
  }

  hoy(): string { return new Date().toISOString().split('T')[0]; }
}