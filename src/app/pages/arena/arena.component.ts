import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Pokemon } from 'src/app/interfaces/interfaces';
import { PokemonService } from 'src/app/services/pokemon.service';

@Component({
  selector: 'app-arena',
  templateUrl: './arena.component.html',
  styleUrls: ['./arena.component.scss']
})
export class ArenaComponent implements OnInit {

  pokemon!: Pokemon;
  pokemonMoves: any = [];
  pokemonOpponent!: Pokemon;


  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      let movesArray = [];
      for(let i = 0; i < 4; i++){
        const randomNumber = this.pokemonService.generateRandomNumber(0, pokemon.moves.length -1);
        movesArray.push(pokemon.moves[randomNumber]);
        pokemon.moves.splice(randomNumber, 1);
      }
      this.pokemonMoves = [...movesArray];
      console.log(this.pokemonMoves)
      this.pokemon = pokemon;
    });
    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      this.pokemonOpponent = pokemon;
    });
  }

}
