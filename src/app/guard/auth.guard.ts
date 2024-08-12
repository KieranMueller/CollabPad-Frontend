import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { inject } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map } from 'rxjs';

export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const username = authService.getUsername();
  const token = authService.getToken();

  if (!username || !token) {
    router.navigateByUrl('/login');
    return of(false);
  }

  return authService.isValidToken(username, token).pipe(
    map((isValid) => {
      if (isValid) return true;
      else {
        router.navigateByUrl('/login');
        return false;
      }
    }),
    catchError(() => {
      router.navigateByUrl('/login');
      return of(false);
    })
  );
};
