import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  Pokemon,
  PokemonEdit,
  PokemonSpecies,
} from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { PokemonService } from 'src/app/services/pokemon.service';
import { LifeContainer, PokemonClass } from '../../shared/game-classes/game-classes';
import { gsap } from 'gsap';
import { TranslateService } from '@ngx-translate/core';
import { wait } from 'src/app/shared/helpers';
import { MoveEffectivinessService } from 'src/app/services/move-effectiviness.service';

@Component({
  selector: 'app-arena-canvas',
  templateUrl: './arena-canvas.component.html',
  styleUrls: ['./arena-canvas.component.scss'],
})
export class ArenaCanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  infoContainer: any;
  pokemonImg = new Image();
  pokemonOpponentImg = new Image();
  openPokeball: boolean = false;
  pokemon!: PokemonEdit;
  pokemonInstance: any;
  pokemonLifecontainer: any;
  pokemonMoves: MoveData[] = [];
  pokemonOpponentMoves: MoveData[] = [];
  pokemonOpponent!: PokemonEdit;
  pokemonOpponentIntance: any;
  pokemonOpponentLifecontainer: any;
  boxMessage = 'chooseActionMessage';
  usedMove = '';
  currentPokemonName = '';
  hasSelectedMove = false;
  opponentHasSelectedMove = false;
  chosenMove!: MoveData;
  pokemonClassName = '';
  pokemonOpponentClassName = '';
  currentTurn!: number;
  turnCount = 0;
  movesContainerArray: HTMLElement[] = [];
  currentMovePosition = 0;
  opponentTextPlaceholder = '';
  petitionsCount: number = 0;
  petitionsCountOpponent: number = 0;
  winner: string = '';
  gameOver = false;

  effectivinessIndex = 1;

  constructor(private pokemonService: PokemonService, 
    private translateService: TranslateService,
    private moveEffectivinessService: MoveEffectivinessService) {}

  ngOnInit(): void {
    this.translateService.get('ARENA').subscribe((data) => {
      this.opponentTextPlaceholder = data.opponent;
    });

    this.pokemonService.turnObservable$.subscribe((turn) => {
      this.currentTurn = turn;

      if (this.currentTurn === 1 && this.hasSelectedMove) {
        console.log(this.pokemonService.getMovesDamage());
        const mostPowerFulAttack = this.pokemonService.getMostPowerfulAttack();
        const mostPowerfulMoveIndex =
          this.pokemonOpponent.pokemonMoves.findIndex(
            (move) => move.name.toLowerCase() === mostPowerFulAttack
          );
        this.gameLoop(
          this.currentTurn,
          this.pokemonOpponent.pokemonMoves[mostPowerfulMoveIndex]
        );
      }
      if (this.currentTurn === 0 && this.hasSelectedMove) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    });
    
    this.ctx = this.canvas.nativeElement.getContext('2d')!;

    forkJoin([
      this.pokemonService.getRandomPokemon(),
      this.pokemonService.getRandomPokemon(),
    ]).subscribe((pokemons: any) => {
      //Pokemon data
      this.pokemonService
        .getLocalizedPokemonName(pokemons[0].id)
        .subscribe((name) => {
          this.pokemon.name = name;
          this.currentPokemonName = name;
          this.pokemonLifecontainer.updateName(this.pokemon.name);
        });

      this.pokemonImg.src = pokemons[0].sprites.back_default;
      this.pokemonImg.onerror = () => {
        this.pokemonImg.src = 'assets/img/ghost-pokemon.png';
      }
      this.pokemonInstance = new PokemonClass(
        { x: 50, y: 225 },
        this.pokemonImg,
        'pepe',
        false,
      );

      this.pokemon = {
        ...pokemons[0],
        pokemonMoves: [],
        pokemonHealth: '100%',
        pokemonSpeed: pokemons[0].stats[5].base_stat,
        pokemonHealthNumber: this.pokemonService.calculatePokemonsHealth(
          pokemons[0].stats[0].base_stat
        ),
        pokemonHealthNumberTotal: this.pokemonService.calculatePokemonsHealth(
          pokemons[0].stats[0].base_stat
        ),
      };

      this.pokemonLifecontainer = new LifeContainer(
        this.pokemon.name,
        this.pokemon.pokemonHealthNumberTotal / this.pokemon.pokemonHealthNumberTotal,
        this.pokemon.pokemonHealthNumberTotal,
        this.pokemon.pokemonHealthNumber,
        this.ctx,
        {
          x: 400,
          y: 250
        }
      );
      this.getPokemonMoves(this.pokemon);

      // Opponent data
      this.pokemonService
        .getLocalizedPokemonName(pokemons[1].id)
        .subscribe((name) => { 
          this.pokemonOpponent.name = name;
          this.pokemonOpponentLifecontainer.updateName(name);
        });

      this.pokemonOpponentImg.src = pokemons[1].sprites.front_default;
      this.pokemonOpponentImg.onerror = () => {
        this.pokemonOpponentImg.src = 'assets/img/ghost-pokemon.png'
      }
      this.pokemonOpponentIntance = new PokemonClass(
        { x: 550, y: 50 },
        this.pokemonOpponentImg,
        'pepe',
        true,
      );
      
      this.pokemonOpponent = {
        ...pokemons[1],
        pokemonMoves: [],
        pokemonHealth: '100%',
        pokemonSpeed: pokemons[1].stats[5].base_stat,
        pokemonHealthNumber: this.pokemonService.calculatePokemonsHealth(
          pokemons[1].stats[0].base_stat
        ),
        pokemonHealthNumberTotal: this.pokemonService.calculatePokemonsHealth(
          pokemons[1].stats[0].base_stat
        ),
      };

      this.pokemonOpponentLifecontainer = new LifeContainer(
        this.pokemonOpponent.name,
        this.pokemonOpponent.pokemonHealthNumberTotal / this.pokemonOpponent.pokemonHealthNumberTotal,
        this.pokemonOpponent.pokemonHealthNumberTotal,
        this.pokemonOpponent.pokemonHealthNumber,
        this.ctx,
        {
          x: 20,
          y: 30
        },
        true
      );

      this.getPokemonMoves(this.pokemonOpponent, true);
      this.pokemonService.updateTurn(
        this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
      );

      this.animate();
    });

  }

  animate() {
    window.requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, 800, 500);
    this.pokemonOpponentIntance.draw(this.ctx);
    this.pokemonInstance.draw(this.ctx);
    this.pokemonLifecontainer.draw();
    this.pokemonOpponentLifecontainer.draw();
  }

  getPokemonMoves(pokemon: Pokemon, isOpponent = false) {
    if (!isOpponent && this.pokemon.pokemonMoves.length > 3) return;
    if (isOpponent && this.pokemonOpponent.pokemonMoves.length > 3) return;
    const randomNumber = this.pokemonService.generateRandomNumber(
      0,
      pokemon.moves.length - 1
    );
    this.pokemonService
      .getMovementInfo(pokemon.moves[randomNumber].move.url)
      .subscribe((move) => {
        if (isOpponent) {
          this.petitionsCountOpponent = this.petitionsCountOpponent + 1;
          const petitionsDone = this.petitionsCountOpponent;
          if (move.damage_class.name === 'status' && petitionsDone < 8) {
            this.getPokemonMoves(this.pokemonOpponent, true);
            return;
          }
          const moveIndex = this.pokemonOpponent.moves.findIndex(
            (movement) =>
              movement.move.name.toLowerCase() === move.name.toLowerCase()
          );
          move.name = this.pokemonService.getLocalizedPokemonMoves(move);
          this.pokemonOpponent.moves.splice(moveIndex, 1);
          this.pokemonOpponent.pokemonMoves.push(move);
          this.pokemonService.saveMovesInService(move);
          if (this.pokemonOpponent.pokemonMoves.length < 4) {
            this.getPokemonMoves(this.pokemonOpponent, true);
            return;
          }
          if (this.pokemonOpponent.pokemonMoves.length > 3) {
            this.pokemonService.calculateEachMoveDamage(
              this.pokemonOpponent.pokemonMoves,
              this.pokemon.types,
              true
            );
            return;
          }
        }
        if (!isOpponent) {
          let movesArray = [];
          this.petitionsCount = this.petitionsCount + 1;
          const petitionsDone = this.petitionsCount;
          if (move.damage_class.name === 'status' && petitionsDone < 8) {
            this.getPokemonMoves(this.pokemon);
            return;
          }
          const moveIndex = this.pokemon.moves.findIndex(
            (movement) =>
              movement.move.name.toLowerCase() === move.name.toLowerCase()
          );
          move.name = this.pokemonService.getLocalizedPokemonMoves(move);
          this.pokemon.moves.splice(moveIndex, 1);
          movesArray.push(move);
          this.pokemon.pokemonMoves = [
            ...this.pokemon.pokemonMoves,
            ...movesArray,
          ];
          this.pokemonService.saveMovesInService(move);
          if (this.pokemon.pokemonMoves.length < 4) {
            this.getPokemonMoves(this.pokemon);
            return;
          }

          if (this.pokemon.pokemonMoves.length > 3) {
            this.pokemonService.calculateEachMoveDamage(
              this.pokemon.pokemonMoves,
              this.pokemonOpponent.types
            );
            return;
          }
        }
      });
  }

  chooseMove(move: MoveData, i: number) {
    if (this.hasSelectedMove) return;
    this.chosenMove = move;
    this.hasSelectedMove = true;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = i;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
    this.pokemonService.updateTurn(this.currentTurn);
  }

  attack(move: MoveData) {
    (async () => {
      this.pokemonOpponent.pokemonHealthNumber =
        this.pokemonService.calculateHealthAfterAttack(
          this.effectivinessIndex,
          this.pokemonOpponent.pokemonHealthNumber!,
          move.power
        );
      this.pokemonOpponent.pokemonHealth =
        (this.pokemonOpponent.pokemonHealthNumber /
          this.pokemonOpponent.pokemonHealthNumberTotal!) *
          100 +
        '%';
    })();
  }

  opponentAttacks(move: MoveData) {
    (async () => {
      this.pokemon.pokemonHealthNumber =
        this.pokemonService.calculateHealthAfterAttack(
          this.effectivinessIndex,
          this.pokemon.pokemonHealthNumber,
          move.power
        );
      this.pokemon.pokemonHealth =
        (this.pokemon.pokemonHealthNumber /
          this.pokemon.pokemonHealthNumberTotal) *
          100 +
        '%';
    })();

    this.opponentHasSelectedMove = false;
  }

  gameLoop(turn: number, move: MoveData) {
    this.effectivinessIndex = this.pokemonService.getSelectedMoveEffectiviness(move);
    const attacker = turn === 0 ? this.pokemon : this.pokemonOpponent;
    const receiver = turn === 0 ? this.pokemonOpponent : this.pokemon;
    (async () => {
      await wait(300);
      turn === 0
        ? (this.currentPokemonName = attacker.name)
        : (this.currentPokemonName =
            this.opponentTextPlaceholder + attacker.name);

      this.usedMove = move.name;
      this.boxMessage = 'moveUse';
      await wait(1000);
      if (this.effectivinessIndex === 0) {
        await wait(1000);
        this.boxMessage = 'noEffect';
        await wait(1500);
        this.goToNextTurn(turn);
        return;
      }
      turn === 0
        ? (this.pokemonClassName = 'attack')
        : (this.pokemonOpponentClassName = 'attack');
      await wait(100);
      turn === 0
        ? (this.pokemonClassName = '')
        : (this.pokemonOpponentClassName = '');
      if (this.moveEffectivinessService.hasMovedMissed(move)) {
        this.boxMessage = 'moveMissed';
        await wait(2000);
        this.goToNextTurn(turn);
        return;
      }
      if(move.power === null) {
        this.boxMessage = 'withoutEffect';
        await wait(2000);
        this.goToNextTurn(turn);
        return;
      }
      await wait(500);
      turn === 0
        ? (this.pokemonOpponentClassName = 'damage')
        : (this.pokemonClassName = 'damage');
      await wait(600);
      this.pokemonOpponentClassName = '';
      this.pokemonClassName = '';
      turn === 0 ? this.attack(move) : this.opponentAttacks(move);
      
      if(this.effectivinessIndex !== 1) {
        this.boxMessage = this.moveEffectivinessService.messageByEffectiviness(this.effectivinessIndex);
        await wait(1500);
      }

      await wait(1000);

      if (this.isGameOver(receiver.pokemonHealthNumber)) {
        turn === 0
          ? (this.pokemonOpponentClassName = 'damage')
          : (this.pokemonClassName = 'damage');
        await wait(1000);
        turn === 0
          ? (this.pokemonOpponentClassName = 'defeat')
          : (this.pokemonClassName = 'defeat');
        this.currentPokemonName = receiver.name;
        this.boxMessage = 'defeat';
        this.winner = attacker.name;
        this.gameOver = true;
        return;
      }

      await wait(1000);

      this.goToNextTurn(turn);
    })();
  }

  goToNextTurn(turn: number) {
    this.turnCount = this.turnCount + 1;
    if (this.turnCount === 2) {
      this.hasSelectedMove = false;
      this.turnCount = 0;
      this.currentPokemonName = this.pokemon.name;
      this.boxMessage = 'chooseActionMessage';
    }
    turn === 0
      ? this.pokemonService.updateTurn(1)
      : this.pokemonService.updateTurn(0);
  }

  isGameOver(life: number) {
    return life <= 0 ? true : false;
  }
}
