import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-challenged-modal',
  templateUrl: './challenged-modal.component.html',
  styleUrls: ['./challenged-modal.component.scss']
})
export class ChallengedModalComponent implements OnInit {

  @Input() challenger!: string;
  _userId!: string | null;

  constructor(private webSocket: WebSocketService,
              private router: Router) {
   }

  ngOnInit(): void {
    this.webSocket.userId$.subscribe(res => this._userId = res);
    this.webSocket.setOpponentId(this.challenger);
  }

  acceptChallenge() {
    const roomId = this.webSocket.generateRandomString();
    this.webSocket.emit('challenge-response', {
      userId: this._userId,
      accept: true,
      challengerId: this.challenger,
      roomId
    });

    this.webSocket.setRoomId(roomId);

    this.router.navigate([`/online-arena/${roomId}`]);
  }

  declineChallenge() {
    this.webSocket.emit('challenge-response', {
      userId: this._userId,
      accept: false,
      challengerId: this.challenger
    });

    this.webSocket.setChallengerData(null);
  }



}
