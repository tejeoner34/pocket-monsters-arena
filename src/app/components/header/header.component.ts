import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  selectedLanguage = 'en';

  @Output() emitThemeChange = new EventEmitter();

  constructor(private translateService: TranslateService,
              private router: Router) {
    this.selectedLanguage = translateService.currentLang;
   }

  ngOnInit(): void {
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

}
