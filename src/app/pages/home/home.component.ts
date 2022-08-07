import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  translations: any;
  showLoginForm: boolean = true;

  constructor(
    public translateService: TranslateService,
    private themeService: ThemeService,
    private router: Router,
    public userService: UserService) {

   }

  ngOnInit(): void {
    this.translateService.stream(["HOME"]).subscribe(({HOME}) => {
      this.translations = HOME;
    })
  }

  onChangeTheme(theme: string) {
    this.themeService.updateTheme(theme);
  }

  onChangeLanguage(language: string) {
    this.translateService.use(language);
    localStorage.setItem('language', language);
  }

  goToArenaPage() {
    this.router.navigate(['/arena']);
  }

  goToArenaCanvasPage() {
    this.router.navigate(['/arena-canvas']);
  }

  goToChallengePage() {
    this.router.navigate(['/challenge']);
  }

}
