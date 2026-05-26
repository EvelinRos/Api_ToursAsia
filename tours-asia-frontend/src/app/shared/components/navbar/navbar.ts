import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  // Propiedades computed para datos del usuario
  userEmail = computed(() => this.auth.usuario()?.email ?? '');

  userInitials = computed(() => {
    const user = this.auth.usuario();
    if (!user) return '';

    // Si hay nombre y apellido, usar primera letra de cada uno
    if (user.first_name && user.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase();
    }

    // Si solo hay nombre, usar primera letra del nombre
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }

    // Si no, usar primeras 2 letras del email
    return user.email.substring(0, 2).toUpperCase();
  });
}