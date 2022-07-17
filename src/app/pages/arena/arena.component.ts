import {
  AfterViewChecked,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';
import {
  KEY_CODE,
  Pokemon,
  PokemonEdit,
} from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { PokemonService } from 'src/app/services/pokemon.service';
import { wait } from 'src/app/shared/helpers';
import { MoveEffectivinessService } from '../../services/move-effectiviness.service';

@Component({
  selector: 'app-arena',
  templateUrl: './arena.component.html',
  styleUrls: ['./arena.component.scss'],
})
export class ArenaComponent implements OnInit, AfterViewChecked {
  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    this.onMoveArrow(event);
  }

  openPokeball: boolean = false;
  pokemon!: PokemonEdit;
  pokemonName$!: Observable<string>;
  pokemonMoves: MoveData[] = [];
  pokemonOpponentMoves: MoveData[] = [];
  pokemonOpponent!: PokemonEdit;
  pokemonOpponentName$!: Observable<string>;
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

  effectivinessIndex = 1;

  constructor(
    private pokemonService: PokemonService,
    private moveEffectivinessService: MoveEffectivinessService,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateService.get('ARENA').subscribe((data) => {
      this.opponentTextPlaceholder = data.opponent;
    });

    this.pokemonService.turnObservable$.subscribe((turn) => {
      this.currentTurn = turn;

      if (this.currentTurn === 1 && this.hasSelectedMove) {
        this.gameLoop(
          this.currentTurn,
          this.pokemonOpponent.pokemonMoves![
            Math.floor(Math.random() * this.pokemonOpponent.pokemonMoves!.length)
          ]
        );
      }
      if (this.currentTurn === 0 && this.hasSelectedMove) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    });

    forkJoin([this.pokemonService.getRandomPokemon(), this.pokemonService.getRandomPokemon()])
      .subscribe(pokemons => {
        //Pokemon data
        this.pokemonName$ = this.pokemonService.getLocalizedPokemonName(
          pokemons[0].id
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
        this.getPokemonMoves(this.pokemon);
        this.currentPokemonName = pokemons[0].name;

        //Opponent data

        this.pokemonOpponentName$ = this.pokemonService.getLocalizedPokemonName(
          pokemons[1].id
        );
        this.pokemonOpponent = {
          ...pokemons[1],
          pokemonMoves: [],
          pokemonHealth: '100%',
          pokemonSpeed: pokemons[0].stats[5].base_stat,
          pokemonHealthNumber: this.pokemonService.calculatePokemonsHealth(
            pokemons[1].stats[0].base_stat
          ),
          pokemonHealthNumberTotal: this.pokemonService.calculatePokemonsHealth(
            pokemons[1].stats[0].base_stat
          ),
        };
        this.getPokemonMoves(this.pokemonOpponent, true);
        this.pokemonService.updateTurn(
          this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
        );

      })

    setTimeout(() => {
      this.openPokeball = true;
    }, 800);
  }

  ngAfterViewChecked(): void {
    this.movesContainerArray = Array.from(
      document.querySelectorAll(
        '.arena__pokemon__moves-container .moves-container__move'
      )
    );
    if (this.movesContainerArray.length > 0) {
      this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
    }
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
      this.pokemon.pokemonHealthNumber = this.pokemonService.calculateHealthAfterAttack(
        this.effectivinessIndex,
        this.pokemon.pokemonHealthNumber!,
        move.power
      );
      this.pokemon.pokemonHealth =
        (this.pokemon.pokemonHealthNumber / this.pokemon.pokemonHealthNumberTotal!) * 100 + '%';
    })();

    this.opponentHasSelectedMove = false;
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
        if (move.damage_class.name === 'status') {
          pokemon.moves.splice(randomNumber, 1);
          isOpponent
            ? this.getPokemonMoves(pokemon, true)
            : this.getPokemonMoves(pokemon);
          return;
        }
        const isInMovesArray = !isOpponent
          ? this.pokemon.pokemonMoves.find((movement) => movement.name === move.name)
          : this.pokemonOpponent.pokemonMoves.find(
              (movement) => movement.name === move.name
            );
        if (!isOpponent && isInMovesArray === undefined) {
          console.log(move.name)
          this.pokemon.pokemonMoves.push(move);
        }
        if (isOpponent && isInMovesArray === undefined) {
          this.pokemonOpponent.pokemonMoves.push(move);
        }
        this.pokemonService.saveMovesInService(move);
        if (!isOpponent && this.pokemon.pokemonMoves.length < 4) {
          this.getPokemonMoves(pokemon);
        }
        if (isOpponent && this.pokemonOpponent.pokemonMoves.length < 4) {
          this.getPokemonMoves(pokemon, true);
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

  isGameOver() {
    if (this.pokemon.pokemonHealthNumber! > 0) {
      alert('You lose');
      return true;
    }
    if (this.pokemonOpponent.pokemonHealthNumber! > 0) {
      alert('You win');
      return true;
    }
    return false;
  }

  gameLoop(turn: number, move: MoveData) {
    this.pokemonService.getTypeInfo(move.type.url).subscribe((type) => {
      const attacker = turn === 0 ? this.pokemon : this.pokemonOpponent;
      const receiver = turn === 0 ? this.pokemonOpponent : this.pokemon;
      this.effectivinessIndex =
        this.moveEffectivinessService.checkEffectiviness(type, receiver.types);
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
        await wait(500);
        turn === 0
          ? (this.pokemonOpponentClassName = 'damage')
          : (this.pokemonClassName = 'damage');
        await wait(600);
        this.pokemonOpponentClassName = '';
        this.pokemonClassName = '';
        turn === 0 ? this.attack(move) : this.opponentAttacks(move);

        await wait(1000);

        this.goToNextTurn(turn);
      })();
    });
  } // falta modificar un poco las velocidades

  goToNextTurn(turn: number) {
    this.turnCount = this.turnCount + 1;
    if (this.turnCount === 2) {
      console.log('finish');
      this.hasSelectedMove = false;
      this.turnCount = 0;
      this.currentPokemonName = this.pokemon.name;
      this.boxMessage = 'chooseActionMessage';
    }
    turn === 0
      ? this.pokemonService.updateTurn(1)
      : this.pokemonService.updateTurn(0);
  }

  onMoveArrow(event: KeyboardEvent) {
    const keycode = event.key;

    if (keycode === KEY_CODE.UP_ARROW) {
      this.moveUp();
    }

    if (keycode === KEY_CODE.RIGHT_ARROW) {
      this.moveRight();
    }

    if (keycode === KEY_CODE.DOWN_ARROW) {
      this.moveDown();
    }

    if (keycode === KEY_CODE.LEFT_ARROW) {
      this.moveLeft();
    }

    if (keycode === KEY_CODE.ENTER) {
      this.onPressEnter();
    }
  }

  moveLeft() {
    if (this.currentMovePosition === 0 || this.currentMovePosition === 2)
      return;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = this.currentMovePosition - 1;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
  }

  moveRight() {
    if (this.currentMovePosition === 1 || this.currentMovePosition === 3)
      return;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = this.currentMovePosition + 1;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
  }

  moveUp() {
    if (this.currentMovePosition === 0 || this.currentMovePosition === 1)
      return;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = this.currentMovePosition - 2;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
  }

  moveDown() {
    console.log(this.currentMovePosition);
    if (this.currentMovePosition === 2 || this.currentMovePosition === 3)
      return;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = this.currentMovePosition + 2;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
  }

  onPressEnter() {
    const move = this.pokemonMoves.find(
      (move) =>
        move.name ===
        this.movesContainerArray[
          this.currentMovePosition
        ].textContent?.toLowerCase()
    );
    if (move !== undefined) {
      this.chooseMove(move, this.currentMovePosition);
    }
  }
}
