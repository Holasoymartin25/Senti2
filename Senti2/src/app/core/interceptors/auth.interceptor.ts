import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthApiService } from '../services/auth-api.service';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthApiService);
  const router = inject(Router);
  const notifications = inject(NotificationService);

  if (skipRefreshFor(req)) {
    return next(req);
  }

  const reqWithToken = isApiRequest(req) ? addToken(req, auth.getToken()) : req;
  return next(reqWithToken).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isApiRequest(req)) {
        if (err.status === 403 || (err.status && err.status >= 500)) {
          const msg = notifications.messageForStatus(err.status, err.error?.message || 'Error en la petición.');
          notifications.error(msg);
          return throwError(() => err);
        }
        if (err.status === 401) {
          if (req.url.includes('diary-entries')) {
            return throwError(() => err);
          }
          notifications.error(notifications.messageForStatus(401, ''));
          const redirect = router.url.startsWith('/login') ? '/inicio' : router.url;
          router.navigate(['/login'], { queryParams: { redirect } });
          return throwError(() => err);
        }
      }
      return throwError(() => err);
    })
  );
};

function isApiRequest(req: HttpRequest<unknown>): boolean {
  return req.url.startsWith(environment.apiUrl);
}

function skipRefreshFor(req: HttpRequest<unknown>): boolean {
  const u = req.url;
  return u.includes('/auth/refresh') || u.includes('/auth/signin') || u.includes('/auth/signup') || u.includes('/auth/verify');
}

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
