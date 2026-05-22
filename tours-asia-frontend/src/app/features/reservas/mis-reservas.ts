import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservasService } from '../../core/services/reservas.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Reserva } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css'
})
export class MisReservasComponent implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  reservas: Reserva[] = [];
  cargando = true;
  error = '';

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarReservas();
  }

  private cargarReservas() {
    this.cargando = true;
    this.error = '';
    this.reservasService.getMisReservas().subscribe({
      next: (response) => {
        this.reservas = response.results;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar tus reservas';
        this.notificationService.error(this.error);
        this.cargando = false;
      }
    });
  }

  verDetalles(id: number) {
    this.router.navigate(['/reservas', id]);
  }
}
