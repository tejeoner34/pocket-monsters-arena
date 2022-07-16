import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
})
export class PokemonComponent implements OnChanges {
  @Input() pokemon!: Pokemon;
  @Input() pokemonName$!: Observable<string>;
  @Input() isOpponent: boolean = false;
  @Input() pokemonHealth = '100%';
  @Input() className!: string;
  @Input() lifePoints!: number;
  @Input() totalLifePoints!: number;
  pokemonHealthNumber = parseInt(this.pokemonHealth.split('%')[0]);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.pokemonHealthNumber = parseInt(this.pokemonHealth.split('%')[0]);
    console.log(this.pokemonHealthNumber);
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
