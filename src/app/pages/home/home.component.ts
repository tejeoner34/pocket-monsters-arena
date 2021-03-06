import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  translations: any;

  constructor(
    public translateService: TranslateService,
    private themeService: ThemeService) {

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
  }

}
