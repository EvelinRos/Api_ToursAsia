import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToursService, TourPayload } from '../../../core/services/tours.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Tour, Destino } from '../../../core/models/models';

@Component({
  selector: 'app-tours-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tours-admin.html',
  styleUrl: './tours-admin.css',
})
export class ToursAdminComponent implements OnInit {
  tours     = signal<Tour[]>([]);
  destinos  = signal<Destino[]>([]);
  cargando  = signal(false);
  formulario = signal(false); // true → muestra el form

  // Estado del formulario
  modoEdicion = signal<Tour | null>(null);
  form: TourPayload = this.resetForm();

  constructor(
    private svc:    ToursService,
    private notify: NotificationService,
  ) {}

  ngOnInit() {
    this.cargar();
    this.svc.getDestinos().subscribe({ next: res => this.destinos.set(res.results) });
  }

  cargar() {
    this.cargando.set(true);
    this.svc.getTours().subscribe({
      next:  res => { this.tours.set(res.results); this.cargando.set(false); },
      error: ()  => { this.notify.error('Error al cargar tours'); this.cargando.set(false); },
    });
  }

  abrirCrear() {
    this.modoEdicion.set(null);
    this.form = this.resetForm();
    this.formulario.set(true);
  }

  abrirEditar(tour: Tour) {
    this.modoEdicion.set(tour);
    this.form = {
      destino:          (tour.destino as any).id ?? (tour.destino as any),
      name:             tour.name,
      duration:         tour.duration,
      price:            tour.price,
      photo_url:        tour.photo_url,
      description:      tour.description,
      what_includes:    [...tour.what_includes],
      what_not_includes: [...tour.what_not_includes],
      meeting_point:    tour.meeting_point,
      time_slots:       [...tour.time_slots],
      is_popular:       tour.is_popular,
      rating:           tour.rating,
    };
    this.formulario.set(true);
  }

  guardar() {
    this.cargando.set(true);
    const edicion = this.modoEdicion();

    const op = edicion
      ? this.svc.actualizarTour(edicion.id, this.form)
      : this.svc.crearTour(this.form);

    op.subscribe({
      next: () => {
        this.notify.success(edicion ? 'Tour actualizado' : 'Tour creado');
        this.formulario.set(false);
        this.cargar();
      },
      error: () => { this.notify.error('Error al guardar el tour'); this.cargando.set(false); },
    });
  }

  togglePopular(tour: Tour) {
    this.svc.togglePopular(tour.id).subscribe({
      next: res => {
        this.tours.update(lista =>
          lista.map(t => t.id === tour.id ? { ...t, is_popular: res.is_popular } : t)
        );
        this.notify.success(res.is_popular ? 'Tour marcado como popular' : 'Tour desmarcado');
      },
      error: () => this.notify.error('No se pudo actualizar'),
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este tour? Las reservas asociadas también serán eliminadas.')) return;
    this.svc.eliminarTour(id).subscribe({
      next:  () => { this.tours.update(lista => lista.filter(t => t.id !== id)); this.notify.success('Tour eliminado'); },
      error: () => this.notify.error('No se pudo eliminar el tour'),
    });
  }

  cancelar() {
    this.formulario.set(false);
  }

  private resetForm(): TourPayload {
    return {
      destino: 0, name: '', duration: 1, price: 0,
      photo_url: '', description: '',
      what_includes: [], what_not_includes: [],
      meeting_point: '', time_slots: [],
      is_popular: false, rating: 4.9,
    };
  }
}
