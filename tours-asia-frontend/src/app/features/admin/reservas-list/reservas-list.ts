import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservasService } from '../../../core/services/reservas.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Reserva } from '../../../core/models/models';

@Component({
  selector: 'app-reservas-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './reservas-list.html',
  styleUrl: './reservas-list.css',
})
export class ReservasListComponent implements OnInit {
  reservas    = signal<Reserva[]>([]);
  cargando    = signal(false);
  filtro      = signal('');
  busqueda    = '';

  // Métricas computadas directamente del array en memoria
  total       = computed(() => this.reservas().length);
  pendientes  = computed(() => this.reservas().filter(r => r.status === 'pendiente').length);
  confirmadas = computed(() => this.reservas().filter(r => r.status === 'confirmada').length);
  rechazadas  = computed(() => this.reservas().filter(r => r.status === 'rechazada').length);

  reservasFiltradas = computed(() => {
    const f = this.filtro();
    const b = this.busqueda.toLowerCase().trim();
    return this.reservas().filter(r => {
      const pasaEstado  = !f || r.status === f;
      const pasaBusqueda = !b
        || r.customer_name.toLowerCase().includes(b)
        || r.customer_email.toLowerCase().includes(b)
        || r.tour.name.toLowerCase().includes(b)
        || String(r.id).includes(b);
      return pasaEstado && pasaBusqueda;
    });
  });

  constructor(
    private svc: ReservasService,
    private notify: NotificationService,
  ) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.svc.getTodasReservas().subscribe({
      next:  res => { this.reservas.set(res.results); this.cargando.set(false); },
      error: ()  => { this.notify.error('Error al cargar reservas'); this.cargando.set(false); },
    });
  }

  cambiarEstado(id: number, nuevoEstado: string, event: MouseEvent) {
    event.stopPropagation(); // evita navegar al detalle
    this.svc.cambiarEstado(id, nuevoEstado).subscribe({
      next: actualizada => {
        this.reservas.update(lista =>
          lista.map(r => r.id === id ? actualizada : r)
        );
        this.notify.success(
          nuevoEstado === 'confirmada'
            ? 'Reserva confirmada correctamente'
            : 'Reserva rechazada',
        );
      },
      error: () => this.notify.error('No se pudo cambiar el estado'),
    });
  }

  eliminar(id: number, event: MouseEvent) {
    event.stopPropagation();
    if (!confirm('¿Eliminar esta reserva? Esta acción no se puede deshacer.')) return;
    this.svc.eliminar(id).subscribe({
      next: () => {
        this.reservas.update(lista => lista.filter(r => r.id !== id));
        this.notify.success('Reserva eliminada');
      },
      error: () => this.notify.error('No se pudo eliminar la reserva'),
    });
  }

  fmtUSD(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(valor);
  }
}