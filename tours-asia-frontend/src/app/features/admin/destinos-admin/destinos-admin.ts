import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToursService, DestinoPayload } from '../../../core/services/tours.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Destino } from '../../../core/models/models';

@Component({
  selector: 'app-destinos-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './destinos-admin.html',
  styleUrl: './destinos-admin.css',
})
export class DestinosAdminComponent implements OnInit {
  destinos  = signal<Destino[]>([]);
  cargando  = signal(false);
  formulario = signal(false);
  modoEdicion = signal<Destino | null>(null);
  form: DestinoPayload = this.resetForm();

  constructor(
    private svc:    ToursService,
    private notify: NotificationService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.cargando.set(true);
    this.svc.getDestinos().subscribe({
      next:  res => { this.destinos.set(res.results); this.cargando.set(false); },
      error: ()  => { this.notify.error('Error al cargar destinos'); this.cargando.set(false); },
    });
  }

  abrirCrear() {
    this.modoEdicion.set(null);
    this.form = this.resetForm();
    this.formulario.set(true);
  }

  abrirEditar(d: Destino) {
    this.modoEdicion.set(d);
    this.form = {
      name: d.name, country: d.country, cover_url: d.cover_url,
      description: d.description, highlights: [...d.highlights],
    };
    this.formulario.set(true);
  }

  guardar() {
    this.cargando.set(true);
    const edicion = this.modoEdicion();
    const op = edicion
      ? this.svc.actualizarDestino(edicion.id, this.form)
      : this.svc.crearDestino(this.form);

    op.subscribe({
      next: () => {
        this.notify.success(edicion ? 'Destino actualizado' : 'Destino creado');
        this.formulario.set(false);
        this.cargar();
      },
      error: () => { this.notify.error('Error al guardar el destino'); this.cargando.set(false); },
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este destino? Los tours asociados quedarán sin destino.')) return;
    this.svc.eliminarDestino(id).subscribe({
      next:  () => { this.destinos.update(l => l.filter(d => d.id !== id)); this.notify.success('Destino eliminado'); },
      error: () => this.notify.error('No se pudo eliminar. Puede tener tours asociados.'),
    });
  }

  cancelar() { this.formulario.set(false); }

  private resetForm(): DestinoPayload {
    return { name: '', country: '', cover_url: '', description: '', highlights: [] };
  }
}
