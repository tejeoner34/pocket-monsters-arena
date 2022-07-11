import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  $themeSubject = new BehaviorSubject(localStorage.getItem('theme') ?? 'lightMode');
  $themeObserver = this.$themeSubject.asObservable();

  constructor() { }

  updateTheme(theme: string) {
    this.$themeSubject.next(theme);
    localStorage.setItem('theme', theme);
  }
}
