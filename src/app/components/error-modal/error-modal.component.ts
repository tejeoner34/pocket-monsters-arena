import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit {

  textbyDefault = ''
  translations: any;

  constructor(
    private translateService: TranslateService,
    public errorService: ErrorService
  ) { }

  ngOnInit(): void {
    this.translateService.stream(['COMMON']).subscribe(({COMMON}) => {
      this.translations = COMMON;
      this.textbyDefault = this.translations.errorOccurred;
    });
  }

  closeModal() {
    this.errorService.setRequestError(false);
  }

}
