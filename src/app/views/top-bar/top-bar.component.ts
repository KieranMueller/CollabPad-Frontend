import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LogoutModalComponent } from '../../components/logout-modal/logout-modal.component'
import { CommonModule } from '@angular/common'
import { SettingsDropdownComponent } from '../../components/settings-dropdown/settings-dropdown.component'

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [LogoutModalComponent, CommonModule, SettingsDropdownComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  username = localStorage.getItem('notepad-username');
  router = inject(Router);
  showLogoutModal = false;
  showSettings = false;

  handleLogout(message: 'close' | 'logout') {
    switch(message) {
        case 'close': {
            this.showLogoutModal = false
            break
        }
        case 'logout': {
            localStorage.removeItem('notepad-username');
            localStorage.removeItem('notepad-jwt');
            this.router.navigateByUrl('/login');
            break
        }
    }
  }

  goHome() {
    this.router.navigateByUrl('/home')
  }
}
