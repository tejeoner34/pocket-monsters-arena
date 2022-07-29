import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PointsService } from 'src/app/services/points.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  form: FormGroup = this.fb.group({
    userName: ['', Validators.required]
  })

  constructor(public fb: FormBuilder, private userService: UserService, private pointsService: PointsService) { }

  ngOnInit(): void {
  }

  submit() {
    const username = this.form.value.userName;
    if(username === '') return; 
    this.userService.getUserInfo(username).subscribe(res => {
      this.userService.updateUserData(res);
      this.userService.getTopUsersAndPosition(username).subscribe(res => {
        this.userService.updateTopUsers(res.topUsers);
        this.userService.updateUserData(res.user);
        this.pointsService.updateUserPoints(res.user.points);
      })
    })
  }

}
