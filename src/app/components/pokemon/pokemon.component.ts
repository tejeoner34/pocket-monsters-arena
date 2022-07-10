import { Component, Input, OnInit } from '@angular/core';
import { Pokemon } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss']
})
export class PokemonComponent implements OnInit {

  @Input() pokemon!: Pokemon;
  @Input() isOpponent: boolean = false;
  @Input() pokemonHealth = '100%';
  pokemonHealthNumber = parseInt(this.pokemonHealth.split('%')[0]);

  constructor() { }

  ngOnInit(): void {
    this.pokemonHealthNumber = parseInt(this.pokemonHealth.split('%')[0]);
  }

}
