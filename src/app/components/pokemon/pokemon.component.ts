import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon, PokemonEdit } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
})
export class PokemonComponent implements OnChanges {
  @Input() pokemon!: PokemonEdit;
  @Input() pokemonName$!: Observable<string>;
  @Input() isOpponent: boolean = false;
  @Input() className!: string;

  pokemonHealthNumber = parseInt(this.pokemon?.pokemonHealth!.split('%')[0]) ?? 100;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.pokemonHealthNumber = parseInt(this.pokemon.pokemonHealth!.split('%')[0]);
  }

  calculateLifeBarColor(life: number) {
    if(life < 40 && life > 20){
      return "orange";
    }else if(life <= 20) {
      return "red";
    }else {
      return "";
    }
  }
}
