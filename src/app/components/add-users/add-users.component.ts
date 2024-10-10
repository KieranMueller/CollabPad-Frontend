import { Component, HostListener, input, OnInit } from '@angular/core';
import { SharedNote } from '../../shared/types';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { backendBaseURL } from '../../shared/env.variables';
import { CommonModule } from '@angular/common';
import { NotesService } from '../../service/notes.service';

@Component({
  selector: 'app-add-users',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.scss',
})
export class AddUsersComponent implements OnInit {
  note = input.required<SharedNote>();
  usernamesToAdd: string[] = [];
  inputVal = '';
  errorMessage = '';
  currentUsers: string[] = [];
  username = localStorage.getItem('notepad-username')

  ngOnInit() {
    this.currentUsers.push(
      ...this.note().sharedUsers!,
      this.note().ownerUsername
    );
  }

  constructor(private http: HttpClient, private notesService: NotesService) {}

  @HostListener('keydown.enter', ['$event'])
  handleEnter(event: any) {
    if (
      this.inputVal &&
      !((event.target as HTMLElement).classList[0] === 'add-btn')
    ) {
      this.addUser();
    }
  }

  addUser() {
    if (this.inputVal) {
      if (this.currentUsers.includes(this.inputVal)) {
        this.customErrorMessage(this.inputVal + ' is already shared');
        this.inputVal = '';
        return;
      }
      if (this.usernamesToAdd.includes(this.inputVal)) {
        this.customErrorMessage(this.inputVal + ' is already queued');
        this.inputVal = '';
        return;
      }
      this.http
        .post(`${backendBaseURL}/username-exists`, this.inputVal)
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.usernamesToAdd.push(this.inputVal);
              this.inputVal = '';
            } else {
              this.customErrorMessage('Unable to find ' + this.inputVal);
            }
          },
          error: (e) => {
            console.log(e);
            this.customErrorMessage('Unable to find ' + this.inputVal);
          },
        });
    }
  }

  customErrorMessage(message: string) {
    this.errorMessage = message;
    this.resetErrorMessage();
  }

  resetErrorMessage() {
    setTimeout(() => {
      this.errorMessage = '';
    }, 2000);
  }

  sendAddUserReq() {
    this.notesService
      .addUsersToNote(this.usernamesToAdd, this.note().id, this.username!)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          window.location.reload();
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  removeUser(username: string) {
    this.usernamesToAdd.splice(this.usernamesToAdd.indexOf(username), 1);
  }

  cancel(event: any) {
    if (event === 'let me out' || event.target.classList[0] === 'container') {
      this.note().isAddingUsers = false;
    }
  }
}
