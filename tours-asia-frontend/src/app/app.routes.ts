import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'tours',
    loadComponent: () => import('./features/tours/tour-list/tour-list').then(m => m.TourListComponent),
  },
  {
    path: 'tours/:id',
    loadComponent: () => import('./features/tours/tour-detail/tour-detail').then(m => m.TourDetailComponent),
  },
  {
    path: 'reservar/:tourId',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservas/reserva').then(m => m.ReservaComponent),
  },
  {
    path: 'mis-reservas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservas/mis-reservas').then(m => m.MisReservasComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./auth/registro/registro').then(m => m.RegistroComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'reservas', pathMatch: 'full' },
      {
        path: 'reservas',
        loadComponent: () => import('./features/admin/reservas-list/reservas-list').then(m => m.ReservasListComponent),
      },
      {
        path: 'reservas/:id',
        loadComponent: () => import('./features/admin/reserva-detalle/reserva-detalle').then(m => m.ReservaDetalleComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];