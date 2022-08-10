import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-challenge',
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss']
})
export class ChallengeComponent implements OnInit {

  // userId!: Observable<string | null>;
  _userId!: string | null;
  hasChallenged = false;
  isWaitingResponse = false;
  rivalHasAccepted = false;
  infoMessageBase = 'CHALLENGE.';
  infoMessageSufix = 'waiting';
  completeInfoMessage = this.infoMessageBase + this.infoMessageSufix;

  constructor(public webSocket: WebSocketService,
              private router: Router) { }

  ngOnInit(): void {

    this.webSocket.listen('get user id').subscribe(res => this.webSocket.setUserId(res));

    this.webSocket.userId$.subscribe(res => this._userId = res);

    this.webSocket.listen('all-users-in-room').subscribe(res => {
      console.log(res)
      this.webSocket.roomIsFull$.next(res.roomComplete);
    }
    )


    this.webSocket.listen('receive-challenge').subscribe(res => {
      this.webSocket.setChallengerData(res);
    });

    this.webSocket.listen('challenge-response').subscribe(res => {
      this.infoMessageSufix = res.message;
      this.rivalHasAccepted = res.accept;
      this.isWaitingResponse = res.accept ? true : false;
      if(res.accept) {
        this.webSocket.setRoomId(res.roomId);
        this.webSocket.setOpponentId(res.userId);
      }
    });
  }

  challengeUser(challengedUserId: string) {
    this.webSocket.emit('challenge-user', {
      challenger: this._userId,
      challengedId: challengedUserId
    });
    this.hasChallenged = true;
    this.isWaitingResponse = true;
  }

  goToArena() {
    // this.webSocket.emit('join-room', {
    //   userId: this._userId,
    //   roomId: this.webSocket.roomId
    // });
    this.router.navigate([`/online-arena/${this.webSocket.roomId}`]);
  }


}
