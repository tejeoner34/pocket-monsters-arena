import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  requestErrorSubject$ = new BehaviorSubject(false);
  requestError$ = this.requestErrorSubject$.asObservable();

  constructor() { }

  setRequestError(value: boolean) {
    this.requestErrorSubject$.next(value);
  }
}
