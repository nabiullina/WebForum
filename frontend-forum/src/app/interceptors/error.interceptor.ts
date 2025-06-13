import {inject} from '@angular/core';
import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {Router} from '@angular/router';
import {NotificationService} from '../services/notification.service';
import {AuthService} from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Произошла ошибка';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Ошибка: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = error.error.message || 'Некорректный запрос';
            break;
          case 401:
            errorMessage = 'Сессия истекла. Пожалуйста, войдите снова.';
            authService.logout();
            break;
          case 403:
            errorMessage = 'Доступ запрещен';
            router.navigate(['/']);
            break;
          case 404:
            errorMessage = 'Ресурс не найден';
            router.navigate(['/not-found']);
            break;
          case 500:
            errorMessage = 'Ошибка сервера';
            break;
        }
      }

      if (!(error.status === 401 && req.url.includes('/api/auth/me'))) {
        notificationService.showError(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
