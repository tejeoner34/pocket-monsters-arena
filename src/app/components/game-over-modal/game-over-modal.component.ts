import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-over-modal',
  templateUrl: './game-over-modal.component.html',
  styleUrls: ['./game-over-modal.component.scss']
})
export class GameOverModalComponent implements OnInit {

  @Input() winner: string = '';

  constructor() { }

  ngOnInit(): void {
  }

  restartGame() {
    window.location.reload();
  }

}
