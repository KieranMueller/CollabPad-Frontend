import {
  Component,
  HostListener,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { TextboxComponent } from '../textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { WebsocketService } from '../../service/websocket.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TextboxComponent, CommonModule, TopBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  globalTabCount = 1;
  tabs: { tabName: string; value: string }[] = [
    {
      tabName: 'new_1',
      value: '',
    },
  ];
  currentSelectedIndex = 0;
  @ViewChildren(TextboxComponent)
  textBoxComponents!: QueryList<TextboxComponent>;
  latestMessage: any;

  constructor(private ws: WebsocketService) {}

  ngOnInit() {
    this.handleWebsocketStuff();
    const history = localStorage.getItem('notepad-history');
    const currentIdx = localStorage.getItem('notepad-current-index');
    const globalTabCount = localStorage.getItem('notepad-globalTabCount');
    if (history) {
      this.tabs = JSON.parse(history);
    }
    if (currentIdx) {
      this.currentSelectedIndex = JSON.parse(currentIdx);
    }
    if (globalTabCount) {
      this.globalTabCount = JSON.parse(globalTabCount);
    }
  }

  handleWebsocketStuff() {
    this.ws.connect('123');
    this.ws.latestMessage.subscribe({
      next: (data) => (this.latestMessage = data),
    });
  }

  @HostListener('dblclick', ['$event'])
  changeTabName(e: KeyboardEvent) {
    const idx = (e.target as HTMLInputElement).value;
    if ((e.target as HTMLInputElement).classList.contains('current-tab')) {
      let res = prompt('Rename tab');
      if (res) {
        this.tabs[parseInt(idx)].tabName = res;
        this.saveFile();
      }
    }
  }

  newTab() {
    let tabLimit = 20;
    if (this.tabs.length <= tabLimit) {
      if (this.globalTabCount >= 99) {
        this.globalTabCount = 0;
      }
      this.tabs.push({ tabName: `new_${++this.globalTabCount}`, value: '' });
    } else {
      alert(`Tab limit of ${tabLimit} reached`);
    }
  }

  @HostListener('keyup', ['$event'])
  @HostListener('click', ['$event'])
  saveFile() {
    this.textBoxComponents.forEach((box) => {
      let obj = box.emitValueAndIndex();
      this.tabs[obj.index].value = obj.value;
    });
    this.ws.send(JSON.stringify(this.tabs), '123');
    this.saveToLocalStorage();
  }

  saveToLocalStorage() {
    localStorage.setItem('notepad-history', JSON.stringify(this.tabs));
    localStorage.setItem(
      'notepad-current-index',
      JSON.stringify(this.currentSelectedIndex)
    );
    localStorage.setItem(
      'notepad-globalTabCount',
      JSON.stringify(this.globalTabCount)
    );
  }

  deleteTab(index: number, event: MouseEvent) {
    if (
      this.tabs[index].value.length === 0 ||
      window.confirm(`Delete '${this.tabs[index].tabName}'?`)
    ) {
      this.tabs.splice(index, 1);
      if (index < this.currentSelectedIndex) {
        this.currentSelectedIndex -= 1;
      }
      this.saveToLocalStorage();
    }
    event.stopPropagation();
  }
}
