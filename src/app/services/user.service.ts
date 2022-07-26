import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = 'http://localhost:5000/users/';
  userSubject$ = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject$.asObservable();

  constructor(private http: HttpClient) { }

  getUserInfo(userName: string): Observable<User> {
    const headers = {'content-type': 'application/json'};
    const body = JSON.stringify({userName})
    return this.http.post<User>(this.url, body, {'headers': headers});
  }

  updateUserData(user: User) {
    this.userSubject$.next(user);
  }

}
