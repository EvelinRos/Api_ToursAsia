import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToursService } from '../../../core/services/tours.service';
import { Tour } from '../../../core/models/models';
import { NavbarComponent } from '../../../shared/components/navbar/navbar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tour-detail',
  imports: [RouterLink, CommonModule, NavbarComponent],
  templateUrl: './tour-detail.html',
})
export class TourDetailComponent implements OnInit {
  tour = signal<Tour | null>(null);

  constructor(
    private route: ActivatedRoute,
    private svc: ToursService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getTour(id).subscribe(t => this.tour.set(t));
  }
}