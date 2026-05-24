import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Reserva } from '../models/models';

export interface CrearReservaPayload {
  tour:              number;
  date:              string;
  time_slot:         string;
  adults:            number;
  children:          number;
  language:          string;
  customer_name:     string;
  customer_lastname: string;
  customer_email:    string;
  customer_phone:    string;
  customer_country:  string;
  notes?:            string;
  total_amount:      number;
}

export interface PaginatedResponse<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Reservas del usuario autenticado (o todas si es admin) */
  getReservas(filtros?: { status?: string; search?: string }) {
    let params = new HttpParams();
    if (filtros?.status) params = params.set('status', filtros.status);
    if (filtros?.search) params = params.set('search', filtros.search);
    params = params.set('_t', Date.now().toString()); // Evitar caché del navegador
    return this.http.get<PaginatedResponse<Reserva>>(`${this.API}/reservas/`, { params });
  }

  /** Alias semántico para el admin */
  getTodasReservas(filtros?: { status?: string; search?: string }) {
    return this.getReservas(filtros);
  }

  getMisReservas() {
    return this.getReservas();
  }

  getReserva(id: number) {
    return this.http.get<Reserva>(`${this.API}/reservas/${id}/`);
  }

  crear(payload: CrearReservaPayload) {
    return this.http.post<Reserva>(`${this.API}/reservas/`, payload);
  }

  /**
   * Cambia el estado de una reserva.
   * @param nota Comentario opcional del administrador.
   */
  cambiarEstado(id: number, status: string, nota = '') {
    return this.http.patch<Reserva>(
      `${this.API}/reservas/${id}/cambiar_estado/`,
      { status, nota },
    );
  }

  eliminar(id: number) {
    return this.http.delete<void>(`${this.API}/reservas/${id}/`);
  }
}