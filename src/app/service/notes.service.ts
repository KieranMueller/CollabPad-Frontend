import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendBaseURL } from '../shared/env.variables';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  constructor(private http: HttpClient) { }

  deleteNoteById(noteId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    if (window.confirm('Are you sure?')) {
      this.http.delete(`${backendBaseURL}/delete-note/${noteId}`, {headers: headers}).subscribe({
        next: (data: any) => {
          console.log(data)
          window.location.reload()
        },
        error: e => {
          console.log(e)
        }
      })
    }
  }

  addCollaborators(username: string, currentCollaborators: string[], note: any) {
    const usernameToAdd = window.prompt(`Enter Username to share on ${note.noteName}`)
    if (usernameToAdd) {
      if (usernameToAdd === username) {
        alert("Don't be silly " + username + "...")
        return;
      }
      if (currentCollaborators.includes(usernameToAdd)) {
        alert(`${usernameToAdd} is already shared on ${note.noteName}`)
        return;
      }
      this.http.patch(`${backendBaseURL}/update-note/${note.id}`, {collaboratorUsernames: [usernameToAdd]}).subscribe({
        next: (data: any) => {
          console.log(Object.keys(data.collaboraterUsernamesAndIds))
          if (Object.keys(data.collaboraterUsernamesAndIds).includes(usernameToAdd)) {
            alert('Added ' + usernameToAdd)
            window.location.reload()
          } else {
            alert('Unable to find ' + usernameToAdd)
          }
        },
        error: e => {
          alert('Unable to find user')
        }
      })
    }
  }

  removeUserFromNote(noteId: number, username: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    this.http.delete(`${backendBaseURL}/note?id=${noteId}&user=${username}`, {headers: headers}).subscribe({
      next: (data: any) => {
        console.log(data)
        window.location.reload()
      },
      error: e => {
        console.log(e)
      }
    })
  }

  removeMultipleUsersFromNoteByUsername(noteId: number, usernames: string[]) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    this.http.post(`${backendBaseURL}/unshare/${noteId}`, usernames,{headers: headers}).subscribe({
      next: (data: any) => {
        console.log(data)
        window.location.reload()
      },
      error: e => {
        console.log(e)
      }
    })
  }

  renameNote(noteId: number, newName: string) {
    return this.http.patch(`${backendBaseURL}/update-note/${noteId}`, {noteName: newName})
  }

  private getHeaders() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    return headers;
  }
}
