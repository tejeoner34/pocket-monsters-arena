import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-rival-disconnect',
  templateUrl: './rival-disconnect.component.html',
  styleUrls: ['./rival-disconnect.component.scss']
})
export class RivalDisconnectComponent implements OnInit {

  constructor(private router: Router,
              private webSocket: WebSocketService) { }

  ngOnInit(): void {
  }

  goToHome() {
    this.router.navigate(['/home']);
    this.webSocket.setRivalDisconnect(false);
    this.webSocket.setRoomIsFull(false);
  }

}
