import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from './services/error.service';
import { LoadingService } from './services/loading.service';
import { ThemeService } from './services/theme.service';
import { UserService } from './services/user.service';

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
    public themeService: ThemeService,
    public loadingService: LoadingService,
    public userService: UserService,
    public errorService: ErrorService
    ) {
    translateService.setDefaultLang(localStorage.getItem('language') ?? 'en');
    translateService.use(localStorage.getItem('language') ?? 'en');
  }

}
