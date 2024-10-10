import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendBaseURL } from '../shared/env.variables';
import { SharedNote } from '../shared/types';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private http: HttpClient) {}

  deleteNoteById(noteId: number) {
    return this.http.delete(`${backendBaseURL}/delete-note/${noteId}`, {
      headers: this.getHeaders(),
    });
  }

  updateNote(note: SharedNote) {
    return this.http.patch(`${backendBaseURL}/update-note/${note.id}`, note, {
      headers: this.getHeaders(),
    });
  }

  updateNoteText(noteId: number, username: string, text: string) {
    return this.http.put(
      `${backendBaseURL}/update-note-text/${noteId}/${username}`,
      text,
      {
        headers: this.getHeaders(),
      }
    );
  }

  removeUserFromNote(noteId: number, username: string) {
    return this.http.delete(
      `${backendBaseURL}/note?id=${noteId}&user=${username}`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  removeMultipleUsersFromNoteByUsername(noteId: number, usernames: string[]) {
    return this.http.post(`${backendBaseURL}/unshare/${noteId}`, usernames, {
      headers: this.getHeaders(),
    });
  }

  renameNote(noteId: number, newName: string, usernameMakingChange: string) {
    return this.http.patch(
      `${backendBaseURL}/update-note/${noteId}`,
      { noteName: newName, usernameMakingChange: usernameMakingChange },
      { headers: this.getHeaders() }
    );
  }

  addUsersToNote(usernames: string[], noteId: number, usernameMakingChange: string) {
    return this.http.patch(
      `${backendBaseURL}/update-note/${noteId}`,
      { collaboratorUsernames: usernames, usernameMakingChange: usernameMakingChange },
      { headers: this.getHeaders() }
    );
  }

  doesUsernameExistOnNote(username: string, noteId: number) {
    return this.http.get(
      `${backendBaseURL}/exists?user=${username}&id=${noteId}`,
      { headers: this.getHeaders() }
    );
  }

  getSharedNotesByUsername(username: string) {
    return this.http.get(
      `${backendBaseURL}/shared-notes?user=${username}`)
  }

  addSingleUserByUsernameToManyNotesByNoteId(username: string, noteIds: number[], usernameMakingChange: string) {
    return this.http.post(`${backendBaseURL}/add-user-to-notes?user=${username}&changer=${usernameMakingChange}`, noteIds, {headers: this.getHeaders()})
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    return headers;
  }
}
