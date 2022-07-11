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
  pokemonMoves: any = [];
  pokemonOpponent!: Pokemon;


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
    });
    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      this.pokemonOpponent = pokemon;
    });
  }

  chooseMove(move: any) {
    console.log(move);
    this.pokemonService.getMovementInfo(move.url).subscribe(movement => {
      this.pokemonService.getTypeInfo(movement.type.url).subscribe(type => {
        this.moveEffectivinessService.checkEffectiviness(type, this.pokemonOpponent.types);
      });

    });
  }

}
