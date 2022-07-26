import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  form: FormGroup = this.fb.group({
    userName: ['', Validators.required]
  })

  constructor(public fb: FormBuilder) { }

  ngOnInit(): void {
  }

}
