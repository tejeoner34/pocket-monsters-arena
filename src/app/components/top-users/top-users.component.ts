import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-top-users',
  templateUrl: './top-users.component.html',
  styleUrls: ['./top-users.component.scss']
})
export class TopUsersComponent implements OnInit {

  topUsers$!: Observable<User[] | null>;
  user$!: Observable<User | null>;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.topUsers$ = this.userService.topUsers$;
    this.user$ = this.userService.user$;
  }

  hideModal() {
    this.userService.hideUsers();
  }

}
