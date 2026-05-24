import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UsuarioAdmin } from '../models/models';
import { PaginatedResponse } from './reservas.service';

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUsuarios(search?: string) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<UsuarioAdmin>>(`${this.API}/usuarios/`, { params });
  }

  getUsuario(id: number) {
    return this.http.get<UsuarioAdmin>(`${this.API}/usuarios/${id}/`);
  }
}
