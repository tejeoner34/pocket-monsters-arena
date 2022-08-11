import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rival-disconnect',
  templateUrl: './rival-disconnect.component.html',
  styleUrls: ['./rival-disconnect.component.scss']
})
export class RivalDisconnectComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

}
