import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { backendBaseURL } from '../../shared/env.variables';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedNote } from '../../shared/types';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../../service/notes.service';
import { SharedWebsocketService } from '../../service/shared-websocket.service';
import { AddUsersComponent } from '../../components/add-users/add-users.component';

@Component({
  selector: 'app-view-shared-note',
  standalone: true,
  imports: [TopBarComponent, CommonModule, FormsModule, AddUsersComponent],
  templateUrl: './view-shared-note.component.html',
  styleUrl: './view-shared-note.component.scss',
})
export class ViewSharedNoteComponent implements OnInit {
  noteId: number | null = null;
  note: SharedNote | null = null;
  collaborators: any = [];
  username: string | null = '';
  isOwner = false;
  titleText = '';
  text = '';
  user: { websocketId: string; machineId: string } = {
    websocketId: '',
    machineId: '',
  };

  ngOnInit() {
    this.setUsername();
    this.getNoteIdFromUrl();
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    private ws: SharedWebsocketService
  ) {}

  setUsername() {
    let username = localStorage.getItem('notepad-username');
    if (username) this.username = username;
  }

  getNoteIdFromUrl() {
    this.route.params.subscribe({
      next: (data: any) => {
        this.noteId = data.noteId;
        this.getNoteById();
      },
    });
  }

  getNoteById() {
    this.http.get(`${backendBaseURL}/shared-note/${this.noteId}`).subscribe({
      next: (data: any) => {
        this.note = data;
        this.text = this.note!.text;
        if (this.note?.ownerUsername === this.username) {
          this.isOwner = true;
        }
        this.collaborators = Object.keys(
          this.note!.collaboraterUsernamesAndIds
        );
        this.populateNoteSharedUsers();
        this.setupWebsocket();
        this.removeOwnerFromCollaboratorsList();
        this.addYouTagToUsername();
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  populateNoteSharedUsers() {
    if (!this.note) {
      alert('Something went wrong');
      return;
    }
    this.note.sharedUsers = Object.keys(this.note.collaboraterUsernamesAndIds);
    if (this.note.sharedUsers.includes(this.note.ownerUsername)) {
      this.note!.sharedUsers.splice(
        this.note.sharedUsers.indexOf(this.note.ownerUsername),
        1
      );
    }
  }

  setupWebsocket() {
    if (
      !this.note ||
      !this.note.websocketId ||
      !this.fetchUserInfoFromLocalStorage()
    ) {
      alert('Something went wrong');
      return;
    }
    this.ws.connect(this.note!.websocketId!);
    this.ws.latestMessage.subscribe({
      next: (data: any) => {
        console.log('latest message', data);
        if (data.payload) {
          if (this.user.machineId !== data.headers.nativeHeaders.machineId[0]) {
            this.text = JSON.parse(data.payload);
          }
        }
      },
    });
  }

  saveStateToDb() {
    this.note!.text = this.text;
    this.notesService
      .updateNoteText(this.note!.id, this.username!, this.text)
      .subscribe({
        next: (res: any) => {},
        error: (e) => {
          console.log(e);
        },
      });
  }

  fetchUserInfoFromLocalStorage(): boolean {
    let websocketId = localStorage.getItem('notepad-websocketId');
    let machineId = localStorage.getItem('notepad-machineId');
    if (websocketId && machineId) {
      this.user.websocketId = websocketId;
      this.user.machineId = machineId;
      return true;
    }
    return false;
  }

  websocketSend() {
    this.ws.send(
      JSON.stringify(this.text),
      this.note!.websocketId!,
      this.username!,
      this.user.machineId
    );
    this.saveStateToDb();
  }

  back() {
    this.router.navigateByUrl('/shared');
  }

  removeOwnerFromCollaboratorsList() {
    for (let name of this.collaborators) {
      if (name === this.note?.ownerUsername) {
        this.collaborators.splice(
          this.collaborators.indexOf(this.note?.ownerUsername),
          1
        );
      }
    }
  }

  addYouTagToUsername() {
    for (let name of this.collaborators) {
      if (name === this.username) {
        this.collaborators[
          this.collaborators.indexOf(this.username)
        ] = `${this.username} (you!)`;
      }
    }
  }

  saveTitle() {
    this.notesService.renameNote(this.noteId!, this.note!.noteName, this.username!).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (e) => {
        alert('Unable to save title');
        console.log(e);
      },
    });
  }

  addUsers() {
    this.note!.isAddingUsers = true;
  }
}
