import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservasService } from '../../../core/services/reservas.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Reserva } from '../../../core/models/models';

@Component({
  selector: 'app-reserva-detalle',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './reserva-detalle.html',
  styleUrl: './reserva-detalle.css',
})
export class ReservaDetalleComponent implements OnInit {
  reserva  = signal<Reserva | null>(null);
  cargando = signal(false);
  nota     = '';                   // nota opcional al cambiar estado
  mostrarConfirmEliminar = signal(false);

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private svc:    ReservasService,
    private notify: NotificationService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getReserva(id).subscribe({
      next:  r  => this.reserva.set(r),
      error: () => { this.notify.error('Reserva no encontrada'); this.router.navigate(['/admin/reservas']); },
    });
  }

  cambiarEstado(nuevoEstado: string) {
    const r = this.reserva();
    if (!r) return;
    this.cargando.set(true);
    this.svc.cambiarEstado(r.id, nuevoEstado, this.nota).subscribe({
      next: actualizada => {
        this.reserva.set(actualizada);
        this.nota = '';
        this.cargando.set(false);
        this.notify.success(
          nuevoEstado === 'confirmada'
            ? '✅ Reserva confirmada'
            : nuevoEstado === 'rechazada'
              ? '❌ Reserva rechazada'
              : 'Estado actualizado',
        );
      },
      error: () => { this.notify.error('No se pudo cambiar el estado'); this.cargando.set(false); },
    });
  }

  eliminar() {
    const r = this.reserva();
    if (!r) return;
    this.svc.eliminar(r.id).subscribe({
      next:  () => { this.notify.success('Reserva eliminada'); this.router.navigate(['/admin/reservas']); },
      error: () => this.notify.error('No se pudo eliminar la reserva'),
    });
  }

  fmtUSD(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2,
    }).format(valor);
  }

  /** Color semántico para el punto del historial */
  colorAccion(accion: string): string {
    const mapa: Record<string, string> = {
      creada:     '#888',
      confirmada: '#2e7d32',
      rechazada:  '#c0392b',
      cancelada:  '#555',
    };
    return mapa[accion] ?? '#888';
  }
}