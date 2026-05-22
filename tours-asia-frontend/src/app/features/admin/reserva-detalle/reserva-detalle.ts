import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservasService } from '../../../core/services/reservas.service';
import { Reserva } from '../../../core/models/models';

@Component({
  selector: 'app-reserva-detalle',
  imports: [RouterLink, CommonModule],
  templateUrl: './reserva-detalle.html',
})
export class ReservaDetalleComponent implements OnInit {
  reserva = signal<Reserva | null>(null);
  cargando = signal(false);

  constructor(private route: ActivatedRoute, private svc: ReservasService) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getReserva(id).subscribe(r => this.reserva.set(r));
  }

  cambiarEstado(estado: string) {
    const r = this.reserva();
    if (!r) return;
    this.cargando.set(true);
    this.svc.cambiarEstado(r.id, estado).subscribe(actualizada => {
      this.reserva.set(actualizada);
      this.cargando.set(false);
    });
  }
}