import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { backendBaseURL } from '../../shared/env.variables';
import { CommonModule } from '@angular/common';
import { SharedNote } from '../../shared/types';
import { NotesService } from '../../service/notes.service';
import { WindowPromptComponent } from '../../components/window-prompt/window-prompt.component';
import { AddUsersComponent } from '../../components/add-users/add-users.component';
import { DeleteNoteComponent } from '../../components/delete-note/delete-note.component';

@Component({
  selector: 'app-shared-notes-page',
  standalone: true,
  imports: [TopBarComponent, CommonModule, WindowPromptComponent, AddUsersComponent, DeleteNoteComponent],
  templateUrl: './shared-notes-page.component.html',
  styleUrl: './shared-notes-page.component.scss'
})
export class SharedNotesPageComponent implements OnInit {
  sharedNotes: SharedNote[] | null = null; 
  username = localStorage.getItem('notepad-username')

  ngOnInit() {
    this.fetchSharedNotes()
  }

  constructor(private router: Router, private http: HttpClient, private notesService: NotesService) {}

  fetchSharedNotes() {
    this.http.get(`${backendBaseURL}/shared-notes?user=${localStorage.getItem('notepad-username')}`).subscribe({
      next: (data: any) => {
        this.sharedNotes = data
        this.populateSharedUsersList()
      },
      error: e => {
        console.log(e)
      }
    })
  }

  populateSharedUsersList() {
    this.sharedNotes?.forEach((note: SharedNote) => {
      note.sharedUsers = Object.keys(note.collaboraterUsernamesAndIds)
      if (note.sharedUsers.includes(note.ownerUsername)) {
        note.sharedUsers.splice(note.sharedUsers.indexOf(note.ownerUsername), 1)
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
    if (event.target.classList.contains('options')) {
      event.stopPropagation()
      note.optionsDropdownOpen = true
      note.removeUsers = false
    }
  }

  optionsDropdownClick(event: any) {
    event.stopPropagation()
  }

  deleteNoteById(note: SharedNote) {
    note.isDeletingNote = true;
    note.optionsDropdownOpen = false;
  }

  deleteNoteByIdReq(noteId: number) {
    console.log(noteId)
    this.notesService.deleteNoteById(noteId).subscribe({
      next: (res: any) => {
        console.log(res)
        window.location.reload()
      }, error: e => {
        console.log(e)
      }
    })
  }

  toggleOptions(note: SharedNote) {
    note.optionsDropdownOpen = false
  }

  renameNote(input: string, note: SharedNote) {
    if (!input) return
    this.notesService.renameNote(note.id, input).subscribe({
      next: (data: any) => {
        window.location.reload()
      }, error: e => {
        console.log(e)
      }
    })
    note.isRenamingNote = false
    note.optionsDropdownOpen = false
  }

  closeRenameNotePrompt(note: SharedNote) {
    note.isRenamingNote = false;
  }

  openRenameNote(note: SharedNote) {
    note.isRenamingNote = true
    note.optionsDropdownOpen = false;
  }

  addCollaborators(note: SharedNote) {
    note.isAddingUsers = true
    note.optionsDropdownOpen = false;
  }

  removeCollaborators(note: SharedNote) {
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

  unshareSelf(note: SharedNote) {
    if (window.confirm(`Leave ${note.noteName}?`))
    note.usersToRemove = [this.username!]
    this.sendRemoveUsersReq(note)
  }

  cancelRemoveUsers(event: MouseEvent, note: SharedNote) {
    event.stopPropagation()
    note.removeUsers = false
    note.usersToRemove = []
  }
}
