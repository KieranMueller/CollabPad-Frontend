import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { map, Observable, of, switchMap } from 'rxjs';
import { NotesService } from '../service/notes.service';
import { AuthService } from '../service/auth.service';

export const userIsSharedOnNote: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean> => {
  const authService = inject(AuthService);
  const notesService = inject(NotesService);
  const router = inject(Router);
  const username = localStorage.getItem('notepad-username');
  const jwt = localStorage.getItem('notepad-jwt');

  return authService.isValidToken(username!, jwt!).pipe(
    switchMap((res) => {
      if (res) {
        const noteId = route.params['noteId'];
        return doesUsernameExistOnNote(username!, noteId, notesService, router);
      } else {
        router.navigateByUrl('/shared');
        return of(false);
      }
    })
  );
};

const doesUsernameExistOnNote = (
  username: string,
  noteId: number,
  notesService: NotesService,
  router: Router
): Observable<boolean> => {
  return notesService.doesUsernameExistOnNote(username, noteId).pipe(
    map((res) => {
      if (res) return true;
      else {
        router.navigateByUrl('/shared');
        return false;
      }
    })
  );
};
