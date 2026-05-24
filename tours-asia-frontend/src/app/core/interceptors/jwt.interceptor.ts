import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * JWT Interceptor: Adjunta el token de acceso a las peticiones HTTP.
 * Si el servidor responde 401 (token expirado), intenta renovar el token
 * usando el refresh token. Si la renovación falla, reintenta la petición
 * sin token para que los endpoints públicos (IsAuthenticatedOrReadOnly)
 * sigan devolviendo datos.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  // No adjuntar token a peticiones de refresh (evita bucle infinito)
  const isRefreshRequest = req.url.includes('/token/refresh/');
  // No adjuntar token a peticiones de login
  const isAuthRequest = req.url.includes('/auth/token/') && !isRefreshRequest;

  if (token && !isRefreshRequest && !isAuthRequest) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401 && auth.token && !isRefreshRequest && !isAuthRequest) {
        const refreshToken = localStorage.getItem('refresh');

        if (refreshToken) {
          return auth.refrescarToken(refreshToken).pipe(
            switchMap(nuevoToken => {
              // Reintentar la petición original con el nuevo token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${nuevoToken}`,
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                  Pragma: 'no-cache',
                }
              });
              return next(retryReq);
            }),
            catchError(() => {
              // El refresh falló → limpiar sesión y reintentar sin token
              auth.logout();
              const anonReq = req.clone({
                headers: req.headers.delete('Authorization')
              });
              return next(anonReq);
            })
          );
        }

        // No hay refresh token → limpiar sesión y reintentar sin token
        auth.logout();
        const anonReq = req.clone({
          headers: req.headers.delete('Authorization')
        });
        return next(anonReq);
      }

      return throwError(() => error);
    })
  );
};