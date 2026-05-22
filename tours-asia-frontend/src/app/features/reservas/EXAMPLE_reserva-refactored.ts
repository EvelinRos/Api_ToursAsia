import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToursService } from '../../core/services/tours.service';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Tour } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-reserva-refactored',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './reserva-refactored.html',
  styleUrl: './reserva-refactored.css'
})
export class ReservaComponentRefactored implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toursService = inject(ToursService);
  private readonly reservasService = inject(ReservasService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  // Signals para estado
  paso = signal(1);
  tour = signal<Tour | null>(null);
  cargando = signal(false);
  reservaCreada = signal<number | null>(null);

  // Reactive Forms - Paso 1: Selección
  paso1Form!: FormGroup;
  // Reactive Forms - Paso 2: Datos Personales
  paso2Form!: FormGroup;

  // Errores inline en lugar de alert()
  errorFecha = signal('');
  errorHora = signal('');
  errorPersonas = signal('');
  errorTerminos = signal('');

  ngOnInit() {
    this.inicializarFormularios();
    this.cargarTour();
  }

  private inicializarFormularios() {
    // Paso 1: Selección de fecha, hora, cantidad
    this.paso1Form = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      adultos: [1, [Validators.required, Validators.min(1)]],
      ninos: [0, [Validators.required, Validators.min(0)]],
      bebes: [0, [Validators.required, Validators.min(0)]],
      idioma: ['Español', Validators.required]
    });

    // Paso 2: Datos personales
    this.paso2Form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-()]+$/)]],
      pais: ['Colombia', Validators.required],
      comentarios: [''],
      aceptaTerminos: [false, Validators.requiredTrue]
    });

    // Pre-llenar datos si el usuario está logueado
    const usuario = this.authService.usuario();
    if (usuario) {
      this.paso2Form.patchValue({
        nombre: usuario.first_name,
        apellido: usuario.last_name,
        email: usuario.email
      });
    }
  }

  private cargarTour() {
    const tourId = +this.route.snapshot.paramMap.get('tourId')!;
    this.toursService.getTour(tourId).subscribe({
      next: (tour) => this.tour.set(tour),
      error: () => {
        this.notificationService.error('No se pudo cargar el tour');
        this.router.navigate(['/tours']);
      }
    });
  }

  irPaso2() {
    // Limpiar errores previos
    this.errorFecha.set('');
    this.errorHora.set('');
    this.errorPersonas.set('');

    // Validar formulario
    if (!this.paso1Form.valid) {
      if (this.paso1Form.get('fecha')?.hasError('required')) {
        this.errorFecha.set('Selecciona una fecha');
      }
      if (this.paso1Form.get('hora')?.hasError('required')) {
        this.errorHora.set('Selecciona un horario');
      }
      return;
    }

    const totalPersonas = 
      this.paso1Form.get('adultos')?.value + 
      this.paso1Form.get('ninos')?.value + 
      this.paso1Form.get('bebes')?.value;

    if (totalPersonas === 0) {
      this.errorPersonas.set('Debe haber al menos 1 persona');
      return;
    }

    this.paso.set(2);
  }

  irPaso3() {
    this.errorTerminos.set('');

    if (!this.paso2Form.valid) {
      if (this.paso2Form.get('aceptaTerminos')?.hasError('required')) {
        this.errorTerminos.set('Debes aceptar los términos y condiciones');
      }
      // Mostrar otros errores
      this.notificationService.error('Por favor completa el formulario correctamente');
      return;
    }

    this.paso.set(3);
  }

  confirmar() {
    const tour = this.tour();
    if (!tour) return;

    // Validar ambos formularios antes de enviar
    if (this.paso1Form.invalid || this.paso2Form.invalid) {
      this.notificationService.error('Por favor completa todos los campos requeridos');
      return;
    }

    this.cargando.set(true);

    const payload = {
      tour: tour.id,
      date: this.paso1Form.get('fecha')!.value,
      time_slot: this.paso1Form.get('hora')!.value,
      adults: this.paso1Form.get('adultos')!.value,
      children: this.paso1Form.get('ninos')!.value,
      language: this.paso1Form.get('idioma')!.value,
      customer_name: this.paso2Form.get('nombre')!.value,
      customer_lastname: this.paso2Form.get('apellido')!.value,
      customer_email: this.paso2Form.get('email')!.value,
      customer_phone: this.paso2Form.get('telefono')!.value,
      customer_country: this.paso2Form.get('pais')!.value,
      notes: this.paso2Form.get('comentarios')!.value,
      total_amount: this.calcularTotal(),
      subtotal: this.calcularSubtotal()
    };

    this.reservasService.crear(payload).subscribe({
      next: (reserva) => {
        this.cargando.set(false);
        this.reservaCreada.set(reserva.id);
        this.notificationService.success('¡Reserva creada exitosamente!');
        setTimeout(() => {
          this.router.navigate(['/mis-reservas']);
        }, 2000);
      },
      error: () => {
        this.cargando.set(false);
        this.notificationService.error('No se pudo crear la reserva. Intenta nuevamente.');
      }
    });
  }

  private calcularTotal(): number {
    const tour = this.tour();
    if (!tour) return 0;
    const adultos = this.paso1Form.get('adultos')?.value || 0;
    const ninos = this.paso1Form.get('ninos')?.value || 0;
    return (adultos + ninos) * tour.price;
  }

  private calcularSubtotal(): number {
    return this.calcularTotal();
  }

  volver() {
    if (this.paso() === 1) {
      this.router.navigate(['/tours']);
    } else {
      this.paso.update(p => p - 1);
    }
  }
}
