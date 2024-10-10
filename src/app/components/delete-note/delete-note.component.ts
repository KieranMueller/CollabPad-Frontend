import { Component, HostListener, input, output } from '@angular/core';
import { SharedNote } from '../../shared/types';

@Component({
  selector: 'app-delete-note',
  standalone: true,
  imports: [],
  templateUrl: './delete-note.component.html',
  styleUrl: './delete-note.component.scss'
})
export class DeleteNoteComponent {
  note = input.required<SharedNote>()
  deleteEmitter = output<number>()

  @HostListener('document:keyup.enter')
  delete() {
    this.deleteEmitter.emit(this.note().id)
  }

  cancel(event: any) {
    if (event === 'let me out' || event.target.classList[0] === 'container')
      this.note().isDeletingNote = false;
  }
}
