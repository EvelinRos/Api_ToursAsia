import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Reserva } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css',
})
export class MisReservasComponent implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly authService    = inject(AuthService);
  private readonly notif          = inject(NotificationService);
  private readonly router         = inject(Router);
  private readonly destroyRef     = inject(DestroyRef);

  // Usar signals para que la detección de cambios funcione correctamente
  readonly reservas = signal<Reserva[]>([]);
  readonly cargando = signal(true);
  readonly error    = signal('');

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.cargando.set(true);
    this.error.set('');

    this.reservasService
      .getMisReservas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const arr = response?.results ?? response;
          this.reservas.set(Array.isArray(arr) ? arr : []);
          this.cargando.set(false);
        },
        error: () => {
          const msg = 'No se pudieron cargar tus reservas';
          this.error.set(msg);
          this.notif.error(msg);
          this.cargando.set(false);
        },
      });
  }

  verDetalles(id: number): void {
    this.router.navigate(['/reservas', id]);
  }

  eliminar(id: number): void {
    if (!confirm('¿Estás seguro de que deseas cancelar y eliminar esta reserva?')) return;

    this.reservasService
      .eliminar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notif.success('Reserva eliminada correctamente');
          this.cargarReservas();
        },
        error: () => this.notif.error('Error al eliminar la reserva'),
      });
  }
}
