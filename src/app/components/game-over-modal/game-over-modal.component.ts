import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user.interface';
import { RestartService } from 'src/app/services/restart.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-game-over-modal',
  templateUrl: './game-over-modal.component.html',
  styleUrls: ['./game-over-modal.component.scss']
})
export class GameOverModalComponent implements OnInit {

  @Input() winner: string = '';
  // @Output() clickEmitter = new EventEmitter();
  user$!: Observable<User | null>;


  constructor(private userService: UserService,
              private restartService: RestartService,
              private router: Router) { }

  ngOnInit(): void {
    this.user$ = this.userService.user$;
  }

  restartGame() {
    // window.location.reload();
    // this.clickEmitter.emit();
    this.restartService.updateRestart();
  }

  returnToHome() {
    this.router.navigate(['/home'])
  }

}
