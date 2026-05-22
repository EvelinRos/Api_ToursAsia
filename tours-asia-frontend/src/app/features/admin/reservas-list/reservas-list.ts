import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservasService } from '../../../core/services/reservas.service';
import { Reserva } from '../../../core/models/models';

@Component({
  selector: 'app-reservas-list',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './reservas-list.html',
  styleUrl: './reservas-list.css'
})
export class ReservasListComponent implements OnInit {
  reservas = signal<Reserva[]>([]);
  filtro = signal<string>('');
  busqueda = '';

  constructor(private svc: ReservasService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.svc.getTodasReservas().subscribe(r => this.reservas.set(r.results));
  }

  get reservasFiltradas(): Reserva[] {
    const f = this.filtro();
    const b = this.busqueda.toLowerCase();
    return this.reservas().filter(r => {
      const pasaFiltro = !f || r.status === f;
      const pasaBusqueda = !b ||
        r.customer_name.toLowerCase().includes(b) ||
        r.customer_email.toLowerCase().includes(b) ||
        String(r.id).includes(b);
      return pasaFiltro && pasaBusqueda;
    });
  }

  totalPor(estado: string) {
    return this.reservas().filter(r => r.status === estado).length;
  }

  cambiarEstado(id: number, estado: string) {
    this.svc.cambiarEstado(id, estado).subscribe(() => this.cargar());
  }
}