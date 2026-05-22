import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      const status = error.status;

      // 401 Unauthorized
      if (status === 401) {
        authService.logout();
        notificationService.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        router.navigate(['/login']);
      }

      // 403 Forbidden
      if (status === 403) {
        notificationService.error('No tienes permiso para realizar esta acción.');
        router.navigate(['/']);
      }

      // 404 Not Found
      if (status === 404) {
        notificationService.error('El recurso solicitado no fue encontrado.');
      }

      // 500 Server Error
      if (status === 500) {
        notificationService.error('Error del servidor. Por favor intenta más tarde.');
      }

      // Generic error
      if (status !== 0) {
        const errorMessage = error.error?.detail || error.error?.message || error.message || 'Ocurrió un error';
        notificationService.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
