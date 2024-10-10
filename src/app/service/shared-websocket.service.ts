import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import * as Stomp from '@stomp/stompjs';
import { backendBaseURL } from '../shared/env.variables';

@Injectable({
  providedIn: 'root',
})
export class SharedWebsocketService {
  url = `${backendBaseURL}/ws`;
  topic = '/topic/sharedMessages';
  stompClient: any;
  public latestMessage = new BehaviorSubject<any>('');

  constructor() {}

  connect(noteWebsocketId: string) {
    console.log(`Initializing WebSocket Connection to ${this.url}`);
    let ws = new SockJS(this.url);
    this.stompClient = Stomp.Stomp.over(ws);
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(
        `${this.topic}/${noteWebsocketId}`,
        (sdkEvent: any) => {
          this.onMessageReceived(sdkEvent);
        }
      );
    });
  }

  disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected');
  }

  errorCallBack(error: any, userWebsocketId: string) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this.connect(userWebsocketId);
    }, 5000);
  }

  send(
    message: string,
    noteWebsocketId: string,
    senderUsername: string,
    senderMachineId: string
  ) {
    console.log(
      `${senderUsername} sending message: ${message} to note.websocketId ${noteWebsocketId}.
      Sender.machineId ${senderMachineId}`
    );
    this.stompClient.send(
      `/app/shared/${noteWebsocketId}`,
      { machineId: senderMachineId },
      message
    );
  }

  onMessageReceived(message: any) {
    console.log('Message Recieved from Server :: ' + message);
    // json parse??
    this.latestMessage.next(JSON.parse(message.body));
    console.log('shared here1', this.latestMessage.getValue());
  }
}
