import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { WebsocketService } from '../../service/websocket.service';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { backendBaseURL } from '../../shared/env.variables';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TopBarComponent, FormsModule],
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
  sendingState = false;
  mobileTapTimeoutId: any;
  isMobile = false;

  constructor(private ws: WebsocketService, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.isMobile = true;
    }
    this.handleLocalStorageStuff();
    this.getStateFromDB();
  }

  getStateFromDB() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    this.http
      .get(
        `${backendBaseURL}/state?username=${localStorage.getItem(
          'notepad-username'
        )}`,
        { headers: headers }
      )
      .subscribe({
        next: (res: any) => {
          console.log('here3', res);
          localStorage.setItem('notepad-websocketId', res.websocketId);
          this.user.websocketId = res.websocketId;
          if (res.history) {
            this.tabs = JSON.parse(res.history);
          } else {
            this.tabs = [
              {
                tabName: 'new_1',
                value: '',
              },
            ];
          }
          this.handleWebsocketStuff();
        },
        error: (e) => {
          console.log(e);
        },
      });
  }

  handleLocalStorageStuff() {
    this.machineId = uuidv4();
    localStorage.setItem('notepad-machineId', this.machineId);
    const currentIdx = localStorage.getItem('notepad-current-index');
    const globalTabCount = localStorage.getItem('notepad-globalTabCount');
    const username = localStorage.getItem('notepad-username');
    if (currentIdx) {
      this.currentSelectedIndex = JSON.parse(currentIdx);
    }
    if (globalTabCount) {
      this.globalTabCount = JSON.parse(globalTabCount);
    }
    if (username) {
      this.user.username = username;
    }
  }

  handleWebsocketStuff() {
    console.log('handleWebSocketStuff()', this.user)
    if (!this.user.websocketId) return;
    this.ws.connect(this.user.websocketId);
    this.ws.latestMessage.next(this.tabs)
    this.ws.latestMessage.subscribe({
      next: (data) => {
        console.log('here2', data);
        let messageMachineId = null;
        if (data.headers) {
          messageMachineId = data.headers.nativeHeaders.machineId[0];
        }
        if (messageMachineId !== this.machineId) {
          if (data.payload) {
            this.tabs = JSON.parse(data.payload);
          }
          this.saveToLocalStorage();
        }
      },
    });
  }

  @HostListener('touchstart', ['$event'])
  holdTabOnMobile(e: KeyboardEvent) {
    this.mobileTapTimeoutId = setTimeout(() => {
      this.changeTabName(e)
    }, 1000)
  }

  @HostListener('touched', ['$event'])
  @HostListener('mouseup', ['$event'])
  @HostListener('mouseleave', ['$event'])
  liftTapMobile() {
    clearTimeout(this.mobileTapTimeoutId)
  }


  @HostListener('dblclick', ['$event'])
  changeTabName(e: KeyboardEvent) {
    const idx = (e.target as HTMLInputElement).value;
    if ((e.target as HTMLInputElement).classList.contains('current-tab')) {
      let tabName = this.tabs[parseInt(idx)].tabName;
      let res = prompt(`Rename ${tabName ? tabName : 'tab'}`);
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
      this.onChange(null);
    } else {
      alert(`Tab limit of ${tabLimit} reached`);
    }
  }

  @HostListener('keyup', ['$event'])
  @HostListener('click', ['$event'])
  onChange(event: any) {
    console.log('onChange()');
    this.sendingState = true;
    this.sendToWebSocket(event);
    this.saveStateToDB();
    this.saveToLocalStorage();
  }

  sendToWebSocket(event: PointerEvent) {
    if (!event || event.type !== 'click') {
      console.log('sending message');
      this.ws.send(
        JSON.stringify(this.tabs),
        this.user.websocketId,
        this.machineId
      );
    }
  }

  saveToLocalStorage() {
    console.log('Save to local storage');
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
    console.log('saveStateToDB()');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('notepad-jwt')}`,
    });
    const payload = {
      username: this.user.username,
      history: JSON.stringify(this.tabs),
    };
    this.http
      .post(`${backendBaseURL}/save`, payload, { headers: headers })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.sendingState = false;
        },
        error: (e) => {
          console.log(e);
        },
      });
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
    this.onChange(null);
  }

  goToSharedNotes() {
    this.router.navigateByUrl('/shared')
  }
}
