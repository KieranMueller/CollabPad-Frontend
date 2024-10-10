import { Component, HostListener, OnInit } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar.component'
import { Router } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { UserService } from '../../service/user.service'
import { CommonModule } from '@angular/common'
import { SharedNote, UserDetailsResponse } from '../../shared/types'
import { NotesService } from '../../service/notes.service'

@Component({
  selector: 'app-search-users',
  standalone: true,
  imports: [TopBarComponent, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './search-users.component.html',
  styleUrl: './search-users.component.scss'
})
export class SearchUsersComponent implements OnInit {
    inputVal = ''
    users: UserDetailsResponse[] = []
    resultsMessage = ''
    username = ''
    ownedNotes: SharedNote[] | null = null;
    addUserToNotesMap = new Map<string, number[]>()
    addUsersIsLoading = false;
    errorMessage = ''
    usersSuccessfullyAddedToNotes = new Map<string, number[]>()
    
    ngOnInit() {
        const username = localStorage.getItem('notepad-username')
        if (username) this.username = username
        this.notesService.getSharedNotesByUsername(this.username).subscribe({
            next: (data: any) => {
                this.ownedNotes = data
                this.populateCollaboratorUsernames()
            }, error: e => {
                console.log(e)
            }
        })
    }

    constructor(private router: Router, private userService: UserService, private notesService: NotesService) {}

    @HostListener('document:keyup.enter', ['$event'])
    handleEnterSearch() {
        if (this.inputVal.length > 0) {
            this.search()
        }
    }

    populateCollaboratorUsernames() {
        this.ownedNotes?.forEach(note => {
            note.collaboratorUsernames = Object.keys(note.collaboraterUsernamesAndIds)
        })
    }

    routeToShared() {
        this.router.navigateByUrl('/shared')
    }

    search() {
        console.log(this.inputVal)
        this.userService.getUsersByUsernameStartsWith(this.inputVal).subscribe({
            next: (res: any) => {
                this.users = res
                console.log(this.users)
                if (this.username?.toLowerCase().includes(this.inputVal.toLowerCase())) this.removeOwnUsername()
                this.resultsMessage = `(${this.users.length} results)`
            }, error: e => {
                console.log(e)
            }
        })
    }

    removeOwnUsername() {
        this.users = this.users.filter(user => user.username !== this.username)
    }

    addToNote(user: UserDetailsResponse) {
        console.log(user)
        user.isAddingToNote = true;
    }

    exitAddToNote(user: UserDetailsResponse) {
        user.isAddingToNote = false
        this.addUserToNotesMap.delete(user.username)
    }

    onCheckboxChange(noteId: number, user: UserDetailsResponse, event: any) {
        let prev = this.addUserToNotesMap.get(user.username)
        if (event.target.checked) {
            if (prev && prev.length > 0) {
                this.addUserToNotesMap.set(user.username, [...prev, noteId])
            } else {
                this.addUserToNotesMap.set(user.username, [noteId])
            }
        } else {
            if (prev) {
                console.log('uncheck existing')
                prev = prev.filter(noteId1 => noteId1 !== noteId)
                if (prev.length === 0) {
                    this.addUserToNotesMap.delete(user.username)
                } else {
                    this.addUserToNotesMap.set(user.username, prev)
                }
            }
        }
        console.log(this.addUserToNotesMap)
    }

    sendAddUserToNotesRequest(user: UserDetailsResponse) {
        this.addUsersIsLoading = true
        console.log(user)
        console.log(this.addUserToNotesMap)
        let noteIdsToAddUserTo = this.addUserToNotesMap.get(user.username)
        if (noteIdsToAddUserTo && noteIdsToAddUserTo.length > 0) {
            this.notesService.addSingleUserByUsernameToManyNotesByNoteId(user.username, noteIdsToAddUserTo, this.username).subscribe({
                next: (res: any) => {
                    console.log(res)
                    this.addUsersIsLoading = false
                    user.isAddingToNote = false;
                    this.handleUserAddedToNotes(user)
                }, error: e => {
                    console.log(e)
                    user.isAddingToNote = false;
                    this.addUsersIsLoading = false
                    this.errorMessage = 'Something went wrong...'
                    setTimeout(() => {
                        this.errorMessage = ''
                    }, 2000)
                }
            })
        }
    }

    handleUserAddedToNotes(user: UserDetailsResponse) {
        let prev = this.usersSuccessfullyAddedToNotes.get(user.username)
        let prevAddUserToNotesMap = this.addUserToNotesMap.get(user.username)
        if (!prev || prev.length < 1) {
            this.usersSuccessfullyAddedToNotes.set(user.username, prevAddUserToNotesMap!)
        } else {
            this.usersSuccessfullyAddedToNotes.set(user.username, [...prevAddUserToNotesMap!, ...prev])
        }
        this.addUserToNotesMap.delete(user.username)
    }
}
