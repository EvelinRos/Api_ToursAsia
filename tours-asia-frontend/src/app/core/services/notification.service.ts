import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);
  private idCounter = 0;
  private readonly DURATION_MS = 5000; // 5 segundos

  success(message: string) {
    this.add('success', message);
  }

  error(message: string) {
    this.add('error', message);
  }

  info(message: string) {
    this.add('info', message);
  }

  warning(message: string) {
    this.add('warning', message);
  }

  private add(type: Notification['type'], message: string) {
    const id = `notification-${this.idCounter++}`;
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: Date.now()
    };

    // Agregar la notificación
    this.notifications.update(current => [...current, notification]);

    // Remover automáticamente después de DURATION_MS
    setTimeout(() => {
      this.remove(id);
    }, this.DURATION_MS);
  }

  remove(id: string) {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }

  clear() {
    this.notifications.set([]);
  }
}
