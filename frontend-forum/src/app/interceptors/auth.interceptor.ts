import {inject} from '@angular/core';
import {HttpInterceptorFn} from '@angular/common/http';
import {AuthService} from '../services/auth.service';
import {catchError, from, switchMap, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const accessToken = authService.getToken();

  const authRequest = accessToken
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${accessToken}` },
      })
    : req;

    return next(authRequest).pipe(
      catchError((error) => {
        console.error(error);
        if (error.status !== 401) {
          return throwError(() => error);
        }

        return from(authService.refreshAccessToken()).pipe(
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
          switchMap(() => {
            const newToken = authService.getToken();
            if (!newToken) {
              authService.logout();
              return throwError(() => new Error('Token refresh failed'));
            }

            const newRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken}` }
            });

            return next(newRequest);
          })
        );
      })
    );
};
