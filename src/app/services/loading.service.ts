import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loadingSubject$ = new BehaviorSubject(false);
  loading$ = this.loadingSubject$.asObservable();

  constructor() { }

  activateLoading() {
    this.loadingSubject$.next(true);
  }

  stopLoading() {
    this.loadingSubject$.next(false);
  }
}
