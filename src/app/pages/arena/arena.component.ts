import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Pokemon, Species } from 'src/app/interfaces/interfaces';
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
  pokemonHealthNumber = 1;
  pokemonHealthNumberTotal = 0
  pokemonSpeed = 0;
  pokemonMoves: any = [];
  pokemonOpponentMoves: any = [];
  pokemonOpponent!: Pokemon;
  pokemonOpponentHealth: string = '100%';
  pokemonOpponentHealthNumber = 1;
  pokemonOpponentHealthNumberTotal = 0;
  pokemonOpponentSpeed = 0;
  boxMessage = 'chooseActionMessage';
  usedMove = '';
  currentPokemonName = '';
  hasSelectedMove = false;
  opponentHasSelectedMove = false;
  chosenMove!: Species;

  effectivinessIndex = 1;


  constructor(private pokemonService: PokemonService, 
              private moveEffectivinessService: MoveEffectivinessService,
              public translateService: TranslateService
              ) { }

  ngOnInit(): void {
    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      this.pokemonSpeed = pokemon.stats[5].base_stat;
      let movesArray = [];
      for(let i = 0; i < 4; i++){
        const randomNumber = this.pokemonService.generateRandomNumber(0, pokemon.moves.length -1);
        movesArray.push(pokemon.moves[randomNumber]);
        pokemon.moves.splice(randomNumber, 1);
      }
      this.pokemonMoves = [...movesArray];
      this.pokemon = pokemon;
      this.currentPokemonName = pokemon.name
      this.pokemonHealthNumber = this.pokemonService.calculatePokemonsHealth(pokemon.stats[0].base_stat);
      this.pokemonHealthNumberTotal = this.pokemonHealthNumber;
    });

    this.pokemonService.getRandomPokemon().subscribe(pokemon => {
      this.pokemonOpponentSpeed = pokemon.stats[5].base_stat;
      let movesArray = [];
      for(let i = 0; i < 4; i++){
        const randomNumber = this.pokemonService.generateRandomNumber(0, pokemon.moves.length -1);
        movesArray.push(pokemon.moves[randomNumber]);
        pokemon.moves.splice(randomNumber, 1);
      }
      this.pokemonOpponentMoves = [...movesArray];
      this.pokemonOpponent = pokemon;
      this.pokemonOpponentHealthNumber = this.pokemonService.calculatePokemonsHealth(pokemon.stats[0].base_stat);
      this.pokemonOpponentHealthNumberTotal = this.pokemonOpponentHealthNumber;
    });

    // this.gameLoop();
  }

  attack(move: Species) {
    this.currentPokemonName = this.pokemon.name;
    this.usedMove = move.name;
    this.boxMessage = 'moveUse';
    this.pokemonService.getMovementInfo(move.url).subscribe(movement => {
      this.pokemonService.getTypeInfo(movement.type.url).subscribe(type => {
        this.effectivinessIndex = this.moveEffectivinessService.checkEffectiviness(type, this.pokemonOpponent.types);
        this.pokemonOpponentHealthNumber = this.pokemonService.calculateHealthAfterAttack(this.effectivinessIndex, this.pokemonOpponentHealthNumber, movement.power);
        this.pokemonOpponentHealth = (this.pokemonOpponentHealthNumber / this.pokemonOpponentHealthNumberTotal)*100 + '%';
      });
    });
    this.hasSelectedMove = false;
    this.opponentChoosesMove(this.pokemonOpponentMoves[Math.floor(Math.random() * this.pokemonOpponentMoves.length)].move);
  }

  opponentChoosesMove(move: Species) {
    this.currentPokemonName = this.pokemonOpponent.name;
    this.usedMove = move.name;
    this.boxMessage = 'moveUse';
    this.pokemonService.getMovementInfo(move.url).subscribe(movement => {
      this.pokemonService.getTypeInfo(movement.type.url).subscribe(type => {
        this.effectivinessIndex = this.moveEffectivinessService.checkEffectiviness(type, this.pokemon.types);
        this.pokemonHealthNumber = this.pokemonService.calculateHealthAfterAttack(this.effectivinessIndex, this.pokemonHealthNumber, movement.power);
        this.pokemonHealth = (this.pokemonHealthNumber / this.pokemonHealthNumberTotal)*100 + '%';
      });
    });
    this.opponentHasSelectedMove = false;
  }

  chooseMove(move: Species) {
    this.chosenMove = move;
  }

  isGameOver() {
    if(this.pokemonHealthNumber > 0) {
      alert('You lose');
      return true;
    }
    if(this.pokemonOpponentHealthNumber > 0) {
      alert('You win');
      return true;
    }
    return false;
  }

  // gameLoop() {
  //   while(this.pokemonHealthNumber > 0 || this.pokemonOpponentHealthNumber > 0){
  //     if( this.hasSelectedMove && this.opponentHasSelectedMove ){
  //       this.attack(this.chosenMove)
  //     }
  //   }
  //   alert('game over')
  // }

  // startGame() {
  //   this.gameLoop();
  // }
}
