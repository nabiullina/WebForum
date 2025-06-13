import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {map} from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  if (authService.getToken()) {
    return authService.fetchCurrentUser().pipe(
      map(user => {
        if (user) return true;
        router.navigate(['/login']);
        return false;
      })
    );
  }

  router.navigate(['/login']);
  return false;
};
