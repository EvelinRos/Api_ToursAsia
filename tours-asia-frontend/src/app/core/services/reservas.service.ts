import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Reserva } from '../models/models';

export interface CrearReservaPayload {
  tour: number;
  date: string;
  time_slot: string;
  adults: number;
  children: number;
  language: string;
  customer_name: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  customer_country: string;
  notes?: string;
  total_amount: number;
  subtotal: number;
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMisReservas() {
    return this.http.get<{ results: Reserva[] }>(`${this.API}/reservas/`);
  }

  getReserva(id: number) {
    return this.http.get<Reserva>(`${this.API}/reservas/${id}/`);
  }

  // Solo admin
  getTodasReservas() {
    return this.http.get<{ results: Reserva[] }>(`${this.API}/reservas/`);
  }

  crear(payload: CrearReservaPayload) {
    return this.http.post<Reserva>(`${this.API}/reservas/`, payload);
  }

  cambiarEstado(id: number, status: string) {
    return this.http.patch<Reserva>(`${this.API}/reservas/${id}/cambiar_estado/`, { status });
  }
}