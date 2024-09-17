import { Component, HostListener, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedNote } from '../../shared/types';

@Component({
  selector: 'app-window-prompt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './window-prompt.component.html',
  styleUrl: './window-prompt.component.scss'
})
export class WindowPromptComponent {
  prompt = input.required<string>()
  note = input<SharedNote>()
  inputText: string = ''
  response = output<string>()
  close = output<any>()

  @HostListener('keydown.enter', ['$event'])
  handleEnter() {
    if (this.inputText) this.emit()
  }

  emit() {
    this.response.emit(this.inputText)
  }

  emitClose(event: any) {
    if (event === 'let me out' || event.target.classList[0] === 'container')
      this.close.emit(this.note())
  }
}
