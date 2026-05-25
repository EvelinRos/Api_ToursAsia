import { Component, OnInit, signal, inject, DestroyRef, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToursService } from '../../core/services/tours.service';
import { Tour, Destino } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';
import { FooterComponent } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private readonly toursService = inject(ToursService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly destinos = signal<Destino[]>([]);
  private readonly allTours = signal<Tour[]>([]);

  // Computed: agregar totalTours a cada destino basado en todos los tours disponibles
  readonly destinosConTours = computed(() => {
    const tours = this.allTours();
    return this.destinos().map(destino => ({
      ...destino,
      totalTours: tours.filter(t => t.destino.id === destino.id).length,
    }));
  });

  ngOnInit(): void {
    // Cargar todos los tours (sin limitación) para contar por destino
    this.toursService
      .getTours()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => this.allTours.set(r.results));

    // Cargar destinos populares (limitado a 6)
    this.toursService
      .getDestinos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => this.destinos.set(r.results.slice(0, 6)));
  }

  verTours(destinoId: number): void {
    this.router.navigate(['/tours'], { queryParams: { destino: destinoId } });
  }
}