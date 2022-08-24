import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MoveData } from 'src/app/interfaces/movements.interface';

@Component({
  selector: 'app-moves-container',
  templateUrl: './moves-container.component.html',
  styleUrls: ['./moves-container.component.scss']
})
export class MovesContainerComponent implements OnInit {

  @Input() moves!: MoveData[];
  @Output() emitSelectedMove = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }


}
