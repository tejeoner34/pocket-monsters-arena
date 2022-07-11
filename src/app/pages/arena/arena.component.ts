import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon } from 'src/app/interfaces/interfaces';
import { PokemonService } from 'src/app/services/pokemon.service';
import { MoveEffectivinessService } from '../../services/move-effectiviness.service';

@Component({
  selector: 'app-arena',
  templateUrl: './arena.component.html',
  styleUrls: ['./arena.component.scss']
})
export class ArenaComponent implements OnInit {

  pokemon!: Pokemon;
  pokemonHealth: string = '100%';
  pokemonHealthNumber = 0;
  pokemonHealthNumberTotal = 0
  pokemonMoves: any = [];
  pokemonOpponent!: Pokemon;
  pokemonOpponentHealth: string = '100%';
  pokemonOpponentHealthNumber = 0;
  pokemonOpponentHealthNumberTotal = 0;

  effectivinessIndex = 1;


  constructor(private pokemonService: PokemonService, 
              private moveEffectivinessService: MoveEffectivinessService
              ) { }

  ngOnInit(): void {
    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      let movesArray = [];
      for(let i = 0; i < 4; i++){
        const randomNumber = this.pokemonService.generateRandomNumber(0, pokemon.moves.length -1);
        movesArray.push(pokemon.moves[randomNumber]);
        pokemon.moves.splice(randomNumber, 1);
      }
      this.pokemonMoves = [...movesArray];
      this.pokemon = pokemon;
      this.pokemonHealthNumber = this.pokemonService.calculatePokemonsHealth(pokemon.stats[0].base_stat);
      this.pokemonHealthNumberTotal = this.pokemonHealthNumber;
    });

    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      this.pokemonOpponent = pokemon;
      this.pokemonOpponentHealthNumber = this.pokemonService.calculatePokemonsHealth(pokemon.stats[0].base_stat);
      this.pokemonOpponentHealthNumberTotal = this.pokemonOpponentHealthNumber;
    });
  }

  chooseMove(move: any) {
    this.pokemonService.getMovementInfo(move.url).subscribe(movement => {
      this.pokemonService.getTypeInfo(movement.type.url).subscribe(type => {
        this.effectivinessIndex = this.moveEffectivinessService.checkEffectiviness(type, this.pokemonOpponent.types);
        this.pokemonOpponentHealthNumber = this.pokemonService.calculateHealthAfterAttack(this.effectivinessIndex, this.pokemonOpponentHealthNumber, movement.power);
        this.pokemonOpponentHealth = (this.pokemonOpponentHealthNumber / this.pokemonOpponentHealthNumberTotal)*100 + '%';
        console.log(this.pokemonOpponentHealth); 
        // hay que gestionar que el porcentaje de vida no baje del 0% y gestionar el orden de los turnos
      });
    });
  }
}
