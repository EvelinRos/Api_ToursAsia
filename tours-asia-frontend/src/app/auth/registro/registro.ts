import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registro.html',
  styleUrls: ['../auth.css'],
})
export class RegistroComponent {
  form = {
    first_name: '', last_name: '', email: '',
    phone: '', country: 'Colombia',
    password1: '', password2: ''
  };
  error = signal('');
  cargando = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.password1 !== this.form.password2) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.auth.registro(this.form).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        const msgs = Object.values(err.error ?? {}).flat().join(' ');
        this.error.set(msgs || 'Error al registrarse.');
        this.cargando.set(false);
      }
    });
  }
}