import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'pocket-monsters-arena';
  isLightMode: boolean = true;

  constructor(
    private translateService: TranslateService,
    public themeService: ThemeService
    ) {
    translateService.setDefaultLang('en');
    translateService.use(localStorage.getItem('language') ?? 'en');
  }

}
