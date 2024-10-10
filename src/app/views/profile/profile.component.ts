import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar.component'
import { RouterModule } from '@angular/router'
import { UserService } from '../../service/user.service'
import { UserDetailsResponse } from '../../shared/types'
import { ImageService } from '../../service/image.service'

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [TopBarComponent, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
    user: UserDetailsResponse | null = null
    message = ''

    constructor(private userService: UserService, private imageService: ImageService) {}
    
    ngOnInit() {
        this.userService.getUserByUsername(localStorage.getItem('notepad-username')!).subscribe({
            next: (res: any) => {
                this.user = res
            }, error: e => {
                this.message = 'Something went wrong...'
                setTimeout(() => {
                    this.message = ''
                }, 2000)
                console.log(e)
            }
        })
    }

    onFileUpload(event: any) {
        const file: File = event.target.files[0]
        this.imageService.changeProfilePicByUsername(this.user!.username, file).subscribe({
            next: () => {
                window.location.reload()
            }, error: e => {
                console.log(e)
            }
        })
    }
}
