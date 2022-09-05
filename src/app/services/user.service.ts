import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { TopUsers, User } from '../interfaces/user.interface';
import { ErrorService } from './error.service';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = 'https://my-monsters-app.herokuapp.com/users/';
  private userSubject$ = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject$.asObservable();
  private topUsersSubject$ = new BehaviorSubject<User[] | null>(null);
  topUsers$ = this.topUsersSubject$.asObservable();
  showTopUsersSubject$ = new BehaviorSubject(false);
  showTopUsers$ = this.showTopUsersSubject$.asObservable();
  private isLoginCompleteSubject$ = new BehaviorSubject(false);
  isLoginComplete$ = this.isLoginCompleteSubject$.asObservable();

  constructor(
    private http: HttpClient , 
    private loadingService: LoadingService,
    private errorService: ErrorService) { }

  getUserInfo(userName: string): Observable<User> {
    this.loadingService.activateLoading();
    const headers = {'content-type': 'application/json'};
    const body = JSON.stringify({userName})
    return this.http.post<User>(this.url, body, {'headers': headers}).pipe(
      finalize(() => {
        this.loadingService.stopLoading();
        this.updateIsLoginComplete(true);
      }),
      catchError(err => {
        this.updateIsLoginComplete(true);
        this.errorService.setRequestError(true);
        return throwError(() => err);
      })
    );
  }

  getTopUsersAndPosition(userName: string): Observable<TopUsers> {
    this.loadingService.activateLoading();
    const headers = {'content-type': 'application/json'};
    const body = JSON.stringify({userName})
    return this.http.post<TopUsers>(`${this.url}top-users`, body, {'headers': headers}).pipe(
      finalize(() => {
        this.loadingService.stopLoading();
      })
    );
  }

  patchUserData(user: User): Observable<User> {
    const headers = {'content-type': 'application/json'};
    const body = JSON.stringify(user)
    return this.http.patch<User>(this.url, body, {'headers': headers}).pipe(
      tap(res => {
        this.updateUserData(res)})
    );
  }

  updateUserData(user: User) {
    this.userSubject$.next(user);
  }

  updateTopUsers(topUsers: User[]) {
    this.topUsersSubject$.next(topUsers);
  }

  showUsers() {
    this.showTopUsersSubject$.next(true);
  }

  hideUsers() {
    this.showTopUsersSubject$.next(false);
  }

  updateIsLoginComplete(value: boolean) {
    this.isLoginCompleteSubject$.next(value);
  }

}
