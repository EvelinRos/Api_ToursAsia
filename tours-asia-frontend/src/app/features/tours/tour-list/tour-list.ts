import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToursService } from '../../../core/services/tours.service';
import { Tour, Destino } from '../../../core/models/models';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-tour-list',
  imports: [RouterLink, CommonModule, FormsModule, NavbarComponent],
  templateUrl: './tour-list.html',
})
export class TourListComponent implements OnInit {
  tours = signal<Tour[]>([]);
  destinos = signal<Destino[]>([]);
  destinoSeleccionado = signal<number | null>(null);

  constructor(private svc: ToursService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.svc.getDestinos().subscribe(r => this.destinos.set(r.results));
    this.route.queryParams.subscribe(params => {
      const destinoId = params['destino'] ? +params['destino'] : undefined;
      this.destinoSeleccionado.set(destinoId ?? null);
      this.cargar(destinoId);
    });
  }

  cargar(destinoId?: number) {
    this.svc.getTours({ destino: destinoId }).subscribe(r => this.tours.set(r.results));
  }

  filtrar(destinoId: number | null) {
    this.destinoSeleccionado.set(destinoId);
    this.cargar(destinoId ?? undefined);
  }
}