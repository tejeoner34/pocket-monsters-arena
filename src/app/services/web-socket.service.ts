import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { v4 as uuidV4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket: any;
  userId$ = new BehaviorSubject<string | null>(null);
  challenger$ = new BehaviorSubject<any | null>(null);
  roomId! : string;
  opponentId!: string;

  constructor() {
    this.socket = io('ws://localhost:5000');
  }

  listen(eventName: string): Observable<any> {
    return new Observable((suscriber) => {
      this.socket.on(eventName, (data: any) => {
        suscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  setUserId(userId: string) {
    this.userId$.next(userId);
  }

  setOpponentId(id: string) {
    this.opponentId = id;
  }

  setChallengerData(data: any) {
    this.challenger$.next(data);
  }

  generateRandomString() {
    return uuidV4();
  }

  setRoomId(roomId: string) {
    this.roomId = roomId;
  }
}
