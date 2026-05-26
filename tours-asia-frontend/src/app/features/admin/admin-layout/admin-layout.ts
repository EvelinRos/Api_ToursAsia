import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservasService } from '../../../core/services/reservas.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayoutComponent implements OnInit {
  pendientes = signal(0);

  constructor(
    public auth: AuthService,
    private reservasSvc: ReservasService,
  ) {}

  ngOnInit() {
    this.cargarPendientes();
  }

  private cargarPendientes() {
    this.reservasSvc.getTodasReservas({ status: 'pendiente' }).subscribe({
      next: res => this.pendientes.set(res.count),
    });
  }
}