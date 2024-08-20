import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.scss',
})
export class TextboxComponent implements OnInit {
  index = input.required<number>();
  valueFromParent = input<string>();
  value = '';

  ngOnInit() {
    if (this.valueFromParent()) {
      this.value = this.valueFromParent() as string;
    }
  }

  emitValueAndIndex() {
    return { index: this.index(), value: this.value };
  }
}
