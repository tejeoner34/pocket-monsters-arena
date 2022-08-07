import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-online-arena',
  templateUrl: './online-arena.component.html',
  styleUrls: ['./online-arena.component.scss']
})
export class OnlineArenaComponent implements OnInit {

  _userId!: string | null;

  constructor(
    private webSocket: WebSocketService
  ) { }

  ngOnInit(): void {
    this.webSocket.userId$.subscribe(res => this._userId = res);
    this.webSocket.listen('get message').subscribe(console.log)
  }

  sendMessage(message: any) {
    // this.messages.push({message, id: this.webSocket.userId});
    this.webSocket.emit('send-message', {message: message.text, id: this._userId, arenaId: this.webSocket.roomId});
  }
}
