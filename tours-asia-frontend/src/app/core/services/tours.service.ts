import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Destino, Tour } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ToursService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDestinos() {
    return this.http.get<{ results: Destino[] }>(`${this.API}/destinos/`);
  }

  getDestino(id: number) {
    return this.http.get<Destino>(`${this.API}/destinos/${id}/`);
  }

  getTours(filtros?: { destino?: number; search?: string }) {
    let params = new HttpParams();
    if (filtros?.destino) params = params.set('destino', filtros.destino);
    if (filtros?.search) params = params.set('search', filtros.search);
    return this.http.get<{ results: Tour[] }>(`${this.API}/tours/`, { params });
  }

  getTour(id: number) {
    return this.http.get<Tour>(`${this.API}/tours/${id}/`);
  }
}