import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { backendBaseURL } from '../../shared/env.variables';
import { CommonModule } from '@angular/common';
import { SharedNote } from '../../shared/types';
import { NotesService } from '../../service/notes.service';

@Component({
  selector: 'app-shared-notes-page',
  standalone: true,
  imports: [TopBarComponent, CommonModule],
  templateUrl: './shared-notes-page.component.html',
  styleUrl: './shared-notes-page.component.scss'
})
export class SharedNotesPageComponent implements OnInit {
  sharedNotes: SharedNote[] | null = null; 
  username = localStorage.getItem('notepad-username')
  usersToRemove: Map<number, string[]> = new Map<number, string[]>()

  ngOnInit() {
    this.fetchSharedNotes()
  }

  constructor(private router: Router, private http: HttpClient, private notesService: NotesService) {}

  fetchSharedNotes() {
    this.http.get(`${backendBaseURL}/shared-notes?user=${localStorage.getItem('notepad-username')}`).subscribe({
      next: (data: any) => {
        this.sharedNotes = data
      },
      error: e => {
        console.log(e)
      }
    })
  }

  createNewSharedNote() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    const reqBody = {noteName: '(Untitled)', text: '', ownerUsername: this.username, collaboratorUsernames: []}
    this.http.post(`${backendBaseURL}/create-shared-note`, reqBody, {headers: headers}).subscribe({
      next: (data: any) => {
        console.log(data)
        this.goToCreatedNote(data.id)
      },
      error: e => {
        console.log(e)
      }
    })
  }

  goToCreatedNote(noteId: number) {
    console.log(noteId)
    this.router.navigateByUrl(`view-shared/${noteId}`)
  }

  backHome() {
    this.router.navigateByUrl('/home')
  }

  viewSharedNote(note: SharedNote) {
    if (!note.removeUsers)
      this.router.navigateByUrl('view-shared/' + note.id)
  }

  handleOptions(event: any, note: SharedNote) {
    console.log(note.usersToRemove)
    if (event.target.classList.contains('options')) {
      event.stopPropagation()
      note.optionsDropdownOpen = true
      note.removeUsers = false
    }
  }

  optionsDropdownClick(event: any) {
    event.stopPropagation()
  }

  deleteNoteById(noteId: number) {
    this.notesService.deleteNoteById(noteId)
  }

  toggleOptions(note: SharedNote) {
    note.optionsDropdownOpen = false
  }

  renameNote(note: SharedNote) {
    let newName = window.prompt(`Rename ${note.noteName}`)
    this.notesService.renameNote(note.id, newName!).subscribe({
      next: (data: any) => {
        console.log(data)
        window.location.reload()
      }, error: e => {
        console.log(e)
      }
    })
  }

  addCollaborators(note: SharedNote) {
    const currentCollaborators = Object.keys(note.collaboraterUsernamesAndIds)
    this.notesService.addCollaborators(this.username!, currentCollaborators, note)
  }

  removeCollaborators(index: number, note: SharedNote) {
    note.optionsDropdownOpen = false
    note.removeUsers = true
  }

  doneRemovingUsers(event: MouseEvent, note: SharedNote) {
    event.stopPropagation()
    note.removeUsers = false;
  }

  addUsersForRemoval(event: MouseEvent, username: string, note: SharedNote) {
    if (note.removeUsers) {
      if (!note.usersToRemove) {
        note.usersToRemove = []
      }
      event.stopPropagation()
      if (!note.usersToRemove?.includes(username)) {
        note.usersToRemove?.push(username)
      } else {
        note.usersToRemove.splice(note.usersToRemove.indexOf(username), 1)
      }
    }
    console.log(note.usersToRemove)
  }

  sendRemoveUsersReq(note: SharedNote) {
    this.notesService.removeMultipleUsersFromNoteByUsername(note.id, note.usersToRemove!)
  }

  cancelRemoveUsers(event: MouseEvent, note: SharedNote) {
    event.stopPropagation()
    note.removeUsers = false
    note.usersToRemove = []
  }
}
