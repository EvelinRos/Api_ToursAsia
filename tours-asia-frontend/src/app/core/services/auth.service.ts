import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginResponse, Usuario } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;

  // Signal que guarda el usuario actual
  private _usuario = signal<Usuario | null>(this.cargarUsuario());

  readonly usuario = this._usuario.asReadonly();
  readonly isLoggedIn = computed(() => !!this._usuario());
  readonly isAdmin = computed(() => !!this._usuario()?.is_staff);

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.API}/token/`, { username: email, password }).pipe(
      tap(res => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
        this._usuario.set(this.decodificarToken(res.access));
      })
    );
  }

  registro(datos: {
    first_name: string; last_name: string;
    email: string; password1: string; password2: string;
    phone: string; country: string;
  }) {
    return this.http.post(`${this.API}/registro/`, datos);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem('access');
  }

  private decodificarToken(token: string): Usuario {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.user_id,
      email: payload.email ?? '',
      first_name: payload.first_name ?? '',
      last_name: payload.last_name ?? '',
      is_staff: payload.is_staff ?? false,
    };
  }

  private cargarUsuario(): Usuario | null {
    const token = localStorage.getItem('access');
    if (!token) return null;
    try {
      return this.decodificarToken(token);
    } catch {
      return null;
    }
  }
}