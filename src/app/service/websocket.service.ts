import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';
import * as Stomp from '@stomp/stompjs';
import { backendBaseURL } from '../shared/env.variables'

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  url = `${backendBaseURL}/ws`
  topic = '/topic/messages';
  stompClient: any;
  public latestMessage = new BehaviorSubject<any>('');

  connect(userWebsocketId: string) {
    console.log(`Initializing WebSocket Connection to ${this.url}`);
    let ws = new SockJS(this.url);
    this.stompClient = Stomp.Stomp.over(ws);
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(
        `${this.topic}/${userWebsocketId}`,
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

  send(message: string, userWebsocketId: string, senderMachineId: string) {
    console.log(`webSocketId ${userWebsocketId} is sending message: ${message}`);
    this.stompClient.send(
      `/app/send/${userWebsocketId}`,
      { machineId: senderMachineId },
      message
    );
  }

  onMessageReceived(message: any) {
    console.log('Message Recieved from Server :: ' + message);
    this.latestMessage.next(JSON.parse(message.body));
    console.log('here1', this.latestMessage.getValue());
  }
}
