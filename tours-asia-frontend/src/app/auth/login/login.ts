import { Component, signal, inject, DestroyRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['../auth.css'],
})
export class LoginComponent {
  private readonly auth       = inject(AuthService);
  private readonly router     = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  email    = '';
  password = '';
  error    = signal('');
  cargando = signal(false);

  submit(): void {
    if (!this.email || !this.password) {
      this.error.set('Completa todos los campos.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.auth
      .login(this.email, this.password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate([this.auth.isAdmin() ? '/admin' : '/']),
        error: () => {
          this.error.set('Correo o contraseña incorrectos.');
          this.cargando.set(false);
        },
      });
  }
}