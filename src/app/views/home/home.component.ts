import { Component, HostListener, OnInit } from '@angular/core';
import { TextboxComponent } from '../textbox/textbox.component';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { WebsocketService } from '../../service/websocket.service';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TextboxComponent, CommonModule, TopBarComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  user = {
    username: '',
    websocketId: '',
  };
  globalTabCount = 1;
  tabs: { tabName: string; value: string }[] = [
    {
      tabName: 'new_1',
      value: '',
    },
  ];
  currentSelectedIndex = 0;
  machineId: string = '';

  constructor(private ws: WebsocketService, private http: HttpClient) {}

  ngOnInit() {
    this.machineId = uuidv4();
    localStorage.setItem('notepad-machineId', this.machineId);
    this.handleLocalStorageStuff();
    this.handleWebsocketStuff();
  }

  handleLocalStorageStuff() {
    const history = localStorage.getItem('notepad-history');
    const currentIdx = localStorage.getItem('notepad-current-index');
    const globalTabCount = localStorage.getItem('notepad-globalTabCount');
    const username = localStorage.getItem('notepad-username');
    const wbesocketId = localStorage.getItem('notepad-websocketId');
    if (history) {
      this.tabs = JSON.parse(history);
    }
    if (currentIdx) {
      this.currentSelectedIndex = JSON.parse(currentIdx);
    }
    if (globalTabCount) {
      this.globalTabCount = JSON.parse(globalTabCount);
    }
    if (username) {
      this.user.username = username;
    }
    if (wbesocketId) {
      this.user.websocketId = wbesocketId;
    }
    console.log(this.user);
  }

  handleWebsocketStuff() {
    this.ws.connect(this.user.websocketId);
    this.ws.latestMessage.subscribe({
      next: (data) => {
        console.log('here2', data);
        const messageMachineId = data.headers.nativeHeaders.machineId[0];
        if (messageMachineId !== this.machineId) {
          this.tabs = JSON.parse(data.payload);
          this.saveToLocalStorage()
        }
      },
    });
  }

  @HostListener('dblclick', ['$event'])
  changeTabName(e: KeyboardEvent) {
    const idx = (e.target as HTMLInputElement).value;
    if ((e.target as HTMLInputElement).classList.contains('current-tab')) {
      let res = prompt('Rename tab');
      if (res) {
        this.tabs[parseInt(idx)].tabName = res;
        this.onChange(null);
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
  onChange(event: any) {
    this.sendToWebSocket(event);
    this.saveToLocalStorage();
  }

  sendToWebSocket(event: any) {
    if (event.type !== 'click') {
      console.log('sending message');
      this.ws.send(
        JSON.stringify(this.tabs),
        this.user.websocketId,
        this.machineId
      );
    }
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

  saveStateToDB() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJLaWVyYW5NdWVsbGVyIiwiaWF0IjoxNzI0MjU3Mzc2LCJleHAiOjE3MjQzNDM3NzZ9.GViqzb5LaX6aSDq8XVtEJKtGrqJ0slyVAkPWc_FPGZfyEXFmoIvaRGKhUx0XYKiL`
    })
    const payload = {
      username: this.user.username,
      history: this.tabs
    }
    this.http.post(`http://localhost:8081/save`, payload, {headers: headers}).subscribe({
      next: res => {
        console.log(res)
      },
      error: e => {
        console.log(e)
      }
    })
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
