import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

/**
 * Error interceptor: Muestra notificaciones de error al usuario.
 *
 * NOTA: Los errores 401 son manejados por el jwt.interceptor (que intenta
 * renovar el token o reintentar sin token). Este interceptor solo muestra
 * mensajes para errores que NO son 401.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError(error => {
      const status = error.status;

      // 401 ya se maneja en jwt.interceptor → no duplicar lógica aquí
      if (status === 401) {
        return throwError(() => error);
      }

      // 403 Forbidden
      if (status === 403) {
        notificationService.error('No tienes permiso para realizar esta acción.');
        router.navigate(['/']);
      }

      // 404 Not Found
      else if (status === 404) {
        notificationService.error('El recurso solicitado no fue encontrado.');
      }

      // 500 Server Error
      else if (status === 500) {
        notificationService.error('Error del servidor. Por favor intenta más tarde.');
      }

      // Otros errores (400, 422, etc.)
      else if (status !== 0) {
        const errorMessage = error.error?.detail || error.error?.message || error.message || 'Ocurrió un error';
        notificationService.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
