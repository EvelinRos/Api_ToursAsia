import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosAdminService } from '../../../core/services/usuarios-admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UsuarioAdmin } from '../../../core/models/models';

@Component({
  selector: 'app-usuarios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios-admin.html',
  styleUrl: './usuarios-admin.css',
})
export class UsuariosAdminComponent implements OnInit {
  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(false);
  busqueda = '';

  constructor(
    private svc:    UsuariosAdminService,
    private notify: NotificationService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(search?: string) {
    this.cargando.set(true);
    this.svc.getUsuarios(search).subscribe({
      next:  res => { this.usuarios.set(res.results); this.cargando.set(false); },
      error: ()  => { this.notify.error('Error al cargar usuarios'); this.cargando.set(false); },
    });
  }

  buscar() {
    this.cargar(this.busqueda.trim() || undefined);
  }
}
