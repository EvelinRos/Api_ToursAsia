import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Destino, Tour } from '../models/models';
import { PaginatedResponse } from './reservas.service';

export interface TourPayload {
  destino:            number;
  name:               string;
  duration:           number;
  price:              number;
  photo_url?:         string;
  description?:       string;
  what_includes?:     string[];
  what_not_includes?: string[];
  meeting_point?:     string;
  time_slots?:        string[];
  is_popular?:        boolean;
  rating?:            number;
}

export interface DestinoPayload {
  name:         string;
  country:      string;
  cover_url?:   string;
  description?: string;
  fun_fact?:    string;
  best_time?:   string;
  language?:    string;
  currency?:    string;
  highlights?:  string[];
}

@Injectable({ providedIn: 'root' })
export class ToursService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Destinos ──────────────────────────────────────────────────────────────

  getDestinos() {
    return this.http.get<PaginatedResponse<Destino>>(`${this.API}/destinos/`);
  }

  getDestino(id: number) {
    return this.http.get<Destino>(`${this.API}/destinos/${id}/`);
  }

  crearDestino(payload: DestinoPayload) {
    return this.http.post<Destino>(`${this.API}/destinos/`, payload);
  }

  actualizarDestino(id: number, payload: Partial<DestinoPayload>) {
    return this.http.patch<Destino>(`${this.API}/destinos/${id}/`, payload);
  }

  eliminarDestino(id: number) {
    return this.http.delete<void>(`${this.API}/destinos/${id}/`);
  }

  // ── Tours ─────────────────────────────────────────────────────────────────

  getTours(filtros?: { destino?: number; search?: string; is_popular?: boolean }) {
    let params = new HttpParams();
    if (filtros?.destino)    params = params.set('destino', filtros.destino);
    if (filtros?.search)     params = params.set('search', filtros.search);
    if (filtros?.is_popular !== undefined)
      params = params.set('is_popular', String(filtros.is_popular));
    return this.http.get<PaginatedResponse<Tour>>(`${this.API}/tours/`, { params });
  }

  getTour(id: number) {
    return this.http.get<Tour>(`${this.API}/tours/${id}/`);
  }

  crearTour(payload: TourPayload) {
    return this.http.post<Tour>(`${this.API}/tours/`, payload);
  }

  actualizarTour(id: number, payload: Partial<TourPayload>) {
    return this.http.patch<Tour>(`${this.API}/tours/${id}/`, payload);
  }

  eliminarTour(id: number) {
    return this.http.delete<void>(`${this.API}/tours/${id}/`);
  }

  togglePopular(id: number) {
    return this.http.patch<{ id: number; is_popular: boolean }>(
      `${this.API}/tours/${id}/toggle_popular/`,
      {},
    );
  }
}