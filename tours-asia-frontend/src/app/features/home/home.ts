import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
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
})
export class HomeComponent implements OnInit {
  private readonly toursService = inject(ToursService);
  private readonly destroyRef   = inject(DestroyRef);

  readonly tours    = signal<Tour[]>([]);
  readonly destinos = signal<Destino[]>([]);

  ngOnInit(): void {
    this.toursService
      .getTours()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => this.tours.set(r.results.slice(0, 6)));

    this.toursService
      .getDestinos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(r => this.destinos.set(r.results.slice(0, 6)));
  }
}