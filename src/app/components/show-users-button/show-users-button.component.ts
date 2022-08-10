import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-show-users-button',
  templateUrl: './show-users-button.component.html',
  styleUrls: ['./show-users-button.component.scss']
})
export class ShowUsersButtonComponent implements OnInit {

  constructor(public userService: UserService) { }

  ngOnInit(): void {
  }

  onClick() {
    this.userService.showUsers();
  }

}
