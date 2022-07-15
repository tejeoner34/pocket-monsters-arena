import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pokeball',
  templateUrl: './pokeball.component.html',
  styleUrls: ['./pokeball.component.scss']
})
export class PokeballComponent implements OnInit {

  @Input() openPokeball: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onOpenPokeball() {
    this.openPokeball = true;
  }

}
