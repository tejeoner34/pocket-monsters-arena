import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestartService {

  restartSubject$ = new Subject();
  restart$ = this.restartSubject$.asObservable();

  constructor(private router: Router) { }

  updateRestart() {
    console.log('ejecutado')
    this.restartSubject$.next(true);
  }

  resetPage(page: string) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([`${page}`]);
  }
}
