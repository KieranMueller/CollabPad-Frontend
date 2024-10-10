import { Component, output } from '@angular/core';

@Component({
  selector: 'app-logout-modal',
  standalone: true,
  imports: [],
  templateUrl: './logout-modal.component.html',
  styleUrl: './logout-modal.component.scss'
})
export class LogoutModalComponent {
    username = localStorage.getItem('notepad-username')
    emitFromModal = output<'close' | 'logout'>()

    closeFromOutside(event: MouseEvent) {
        if ((event.target as HTMLElement).classList[0] === 'container') this.emitCloseOrLogout('close')
    }

    emitCloseOrLogout(message: 'close' | 'logout') {
        this.emitFromModal.emit(message)
    }

}
