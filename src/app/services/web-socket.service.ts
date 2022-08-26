import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { v4 as uuidV4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  socket: any;
  userId$ = new BehaviorSubject<string | null>(null);
  challenger$ = new BehaviorSubject<any | null>(null);
  roomIsFull$ = new BehaviorSubject(false);
  rivalDisconnectSubject$ = new BehaviorSubject(false);
  rivalDisconnect$ = this.rivalDisconnectSubject$.asObservable();
  roomId! : string;
  opponentId!: string;
  timer: any = null;
  timer$ = new Subject<number>();

  constructor() {
    this.socket = io('https://my-monsters-app.herokuapp.com/');
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

  setRivalDisconnect(value: boolean) {
    this.rivalDisconnectSubject$.next(value);
  }

  setRoomIsFull(value: boolean) {
    this.roomIsFull$.next(value);
  }

  startTimer(duration: number) {
    let durationLeft = duration
    this.timer = setInterval(() => {
      this.timer$.next(durationLeft);
      if(durationLeft === 0) {
        clearInterval(this.timer);
        this.timer = null;
      } else {
        durationLeft -= 1
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }
}
