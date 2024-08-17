import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-socket-demo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './socket-demo.component.html',
  styleUrl: './socket-demo.component.scss',
})
export class SocketDemoComponent implements OnInit {
  ws = new WebSocket('ws://localhost:8081/ws');
  ws2 = new WebSocket('ws://localhost:8081/ws');
  value = ''; 
  value2 = '';

  ngOnInit() {
    this.ws.onmessage = (message) => {
      console.log(message.data)
      this.value2 += message.data
    }
  }

  send(char: string) {
    console.log(char)
    console.log('Sending message');
    this.ws.send(char);
  }

  send2() {}
}
