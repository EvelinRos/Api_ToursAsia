import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class ToastComponent {
  notificationService = inject(NotificationService);

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'icon-check-circle';
      case 'error':
        return 'icon-alert-circle';
      case 'warning':
        return 'icon-alert';
      case 'info':
      default:
        return 'icon-info';
    }
  }

  removeNotification(id: string) {
    this.notificationService.remove(id);
  }
}
