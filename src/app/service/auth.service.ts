import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { backendBaseURL } from '../shared/env.variables'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isValidToken(username: string, token: string): Observable<boolean> {
    return inject(HttpClient)
      .post(`${backendBaseURL}/validate`, { username, token })
      .pipe(
        map((res) => res === true),
        catchError(() => of(false))
      );
  }

  getUsername() {
    return localStorage.getItem('notepad-username');
  }

  getToken() {
    return localStorage.getItem('notepad-jwt');
  }
}
