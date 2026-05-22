import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToursService } from '../../core/services/tours.service';
import { Tour, Destino } from '../../core/models/models';
import { NavbarComponent } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule, NavbarComponent],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  tours = signal<Tour[]>([]);
  destinos = signal<Destino[]>([]);

  constructor(private toursService: ToursService) {}

  ngOnInit() {
    this.toursService.getTours().subscribe(r => this.tours.set(r.results.slice(0, 6)));
    this.toursService.getDestinos().subscribe(r => this.destinos.set(r.results.slice(0, 6)));
  }
}