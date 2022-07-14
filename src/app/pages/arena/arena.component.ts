import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Pokemon, Species } from 'src/app/interfaces/interfaces';
import { PokemonService } from 'src/app/services/pokemon.service';
import { wait } from 'src/app/shared/helpers';
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
  pokemonClassName = '';
  pokemonOpponentClassName = '';
  currentTurn!: number;
  turnCount = 0;
  

  effectivinessIndex = 1;


  constructor(private pokemonService: PokemonService, 
              private moveEffectivinessService: MoveEffectivinessService,
              public translateService: TranslateService
              ) { }

  ngOnInit(): void {
    this.pokemonService.turnObservable$.subscribe(turn => {
      this.currentTurn = turn;
      console.log(this.currentTurn)
      console.log(this.hasSelectedMove) 
      if(this.currentTurn === 1 && this.hasSelectedMove){
        this.gameLoop(this.currentTurn, this.pokemonOpponentMoves[Math.floor(Math.random() * this.pokemonOpponentMoves.length)].move);
      }
      if(this.currentTurn === 0 && this.hasSelectedMove) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    })
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
      this.pokemonService.updateTurn(this.pokemonSpeed > this.pokemonOpponentSpeed? 0 : 1);
    });

    // this.gameLoop();
  }

  attack(move: Species) {
    (async () => {
      this.currentPokemonName = this.pokemon.name;
      this.usedMove = move.name;
      this.boxMessage = 'moveUse';
      await wait(100);
      this.pokemonOpponentClassName = 'damage';
      await wait(200);
      this.pokemonOpponentClassName = '';
      this.pokemonService.getMovementInfo(move.url).subscribe(movement => {
        this.pokemonService.getTypeInfo(movement.type.url).subscribe(type => {
          this.effectivinessIndex = this.moveEffectivinessService.checkEffectiviness(type, this.pokemonOpponent.types);
          this.pokemonOpponentHealthNumber = this.pokemonService.calculateHealthAfterAttack(this.effectivinessIndex, this.pokemonOpponentHealthNumber, movement.power);
          this.pokemonOpponentHealth = (this.pokemonOpponentHealthNumber / this.pokemonOpponentHealthNumberTotal)*100 + '%';
        });
      });
      // this.opponentAttacks(this.pokemonOpponentMoves[Math.floor(Math.random() * this.pokemonOpponentMoves.length)].move);
    })();
  }

  opponentAttacks(move: Species) {
    console.log('attack')
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
    // this.attack(move);
  }

  chooseMove(move: Species) {
    if(this.hasSelectedMove) return;
    this.chosenMove = move;
    this.hasSelectedMove = true;
    this.pokemonService.updateTurn(this.currentTurn);
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

  gameLoop(turn: number, move: Species) {
    console.log(turn)

    const attacker = turn === 0 ? this.pokemon : this.pokemonOpponent;
    const receiver = turn === 0 ? this.pokemonOpponent : this.pokemon;

    (async () => {
      await wait(500);
      this.currentPokemonName = attacker.name;
      this.usedMove = move.name;
      this.boxMessage = 'moveUse';
      await wait(1000);
      turn === 0 
        ? this.pokemonClassName = 'attack'
        : this.pokemonOpponentClassName = 'attack'
      await wait(100);
      turn === 0
        ? this.pokemonClassName = ''
        : this.pokemonOpponentClassName = '';
      await wait(500);
      turn === 0
        ? this.pokemonOpponentClassName = 'damage'
        : this.pokemonClassName = 'damage'
      await wait(600);
      this.pokemonOpponentClassName = '';
      this.pokemonClassName = '';
      turn === 0
        ? this.attack(move)
        : this.opponentAttacks(move)
      
      await wait(2000);
      
      // if(turn === 1)this.boxMessage = 'chooseActionMessage';
      this.turnCount = this.turnCount + 1;
      if(this.turnCount === 2) {
        console.log('finish')
        this.hasSelectedMove = false;
        this.turnCount = 0;
        this.currentPokemonName = this.pokemon.name;
        this.boxMessage = 'chooseActionMessage';
      }
      await wait(100);
      turn === 0
        ? this.pokemonService.updateTurn(1)
        : this.pokemonService.updateTurn(0)

    })();
  }// falta modificar un poco las velocidades

}
