import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { backendBaseURL } from '../../shared/env.variables';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedNote } from '../../shared/types';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../service/notes.service';

@Component({
  selector: 'app-view-shared-note',
  standalone: true,
  imports: [TopBarComponent, CommonModule, FormsModule],
  templateUrl: './view-shared-note.component.html',
  styleUrl: './view-shared-note.component.scss'
})
export class ViewSharedNoteComponent implements OnInit {
  noteId: number | null = null;
  note: SharedNote | null = null;
  collaborators: any = []
  username: string | null = ''
  isOwner = false;
  titleText = ''

  ngOnInit() {
    this.setUsername()
    this.getNoteIdFromUrl()
    this.getNoteById()
  }

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private notesService: NotesService) {}

  setUsername() {
    let username = localStorage.getItem('notepad-username')
    if (username) this.username = username;
  }

  getNoteIdFromUrl() {
    this.route.params.subscribe({
      next: (data: any) => {
        this.noteId = data.noteId
      }
    })
  }

  getNoteById() {
    this.http.get(`${backendBaseURL}/shared-note/${this.noteId}`).subscribe({
      next: (data: any) => {
        this.note = data
        if (this.note?.ownerUsername === this.username) {
          this.isOwner = true;
        }
        this.collaborators = Object.keys(this.note!.collaboraterUsernamesAndIds)
        this.removeOwnerFromCollaboratorsList()
        this.addYouTagToUsername()
      },
      error: e => {
        console.log(e)
      }
    })
  }

  back() {
    this.router.navigateByUrl('/shared')
  }

  removeOwnerFromCollaboratorsList() {
    for (let name of this.collaborators) {
      if (name === this.note?.ownerUsername) {
        this.collaborators.splice(this.collaborators.indexOf(this.note?.ownerUsername), 1)
      }
    }
  }

  addYouTagToUsername() {
    for (let name of this.collaborators) {
      if (name === this.username) {
        this.collaborators[this.collaborators.indexOf(this.username)] = `${this.username} (you!)`
      }
    }
  }

  saveTitle() {
    this.notesService.renameNote(this.noteId!, this.note!.noteName).subscribe({
      next: (data: any) => {
        console.log(data)
      }, error: e => {
        alert('Unable to save title')
        console.log(e)
      }
    })
  }

  addUsers() {
    this.notesService.addCollaborators(this.username!, this.collaborators, this.note)
  }
}
