import {
  AfterViewChecked,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  KEY_CODE,
  Move,
  Pokemon,
  Species,
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
  pokemon!: Pokemon;
  pokemonName$!: Observable<string>;
  pokemonHealth: string = '100%';
  pokemonHealthNumber = 1;
  pokemonHealthNumberTotal = 0;
  pokemonSpeed = 0;
  pokemonMoves!: MoveData[];
  pokemonOpponentMoves: any = [];
  pokemonOpponent!: Pokemon;
  pokemonOpponentName$!: Observable<string>;
  pokemonOpponentHealth: string = '100%';
  pokemonOpponentHealthNumber = 1;
  pokemonOpponentHealthNumberTotal = 0;
  pokemonOpponentSpeed = 0;
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
          this.pokemonOpponentMoves[
            Math.floor(Math.random() * this.pokemonOpponentMoves.length)
          ]
        );
      }
      if (this.currentTurn === 0 && this.hasSelectedMove) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    });

    this.pokemonService.getRandomPokemon().subscribe((pokemon) => {
      this.pokemonName$ = this.pokemonService.getLocalizedPokemonName(
        pokemon.id
      );
      this.pokemonSpeed = pokemon.stats[5].base_stat;
      let movesArray: MoveData | any = [];
      for (let i = 0; i < 4; i++) {
        console.log('loop');
        const randomNumber = this.pokemonService.generateRandomNumber(
          0,
          pokemon.moves.length - 1
        );
        this.pokemonService
          .getMovementInfo(pokemon.moves[randomNumber].move.url)
          .subscribe((move) => {
            movesArray.push(move);
            pokemon.moves.splice(randomNumber, 1);
            if (i >= 3) {
              const checkMovesTypeArray = movesArray.filter(
                (move: MoveData) => move.damage_class.name === 'status'
              );
              if (checkMovesTypeArray.length >= 3) {
                console.log('enters');
                const indexToDelete = movesArray.indexOf(
                  (move: MoveData) => move.damage_class.name === 'status'
                );
                movesArray.splice(indexToDelete, 1);
                i = i - 1;
              }
            }
            this.pokemonService.saveMovesInService(move);
            this.pokemonMoves = [...movesArray];
          });
        // movesArray.push(pokemon.moves[randomNumber]);
      }
      this.pokemon = pokemon;
      this.currentPokemonName = pokemon.name;
      this.pokemonHealthNumber = this.pokemonService.calculatePokemonsHealth(
        pokemon.stats[0].base_stat
      );
      this.pokemonHealthNumberTotal = this.pokemonHealthNumber;
    });

    this.pokemonService.getRandomPokemon().subscribe((pokemon) => {
      this.pokemonOpponentName$ = this.pokemonService.getLocalizedPokemonName(
        pokemon.id
      );
      this.pokemonOpponentSpeed = pokemon.stats[5].base_stat;
      let movesArray: MoveData | any = [];
      for (let i = 0; i < 4; i++) {
        const randomNumber = this.pokemonService.generateRandomNumber(
          0,
          pokemon.moves.length - 1
        );
        this.pokemonService
          .getMovementInfo(pokemon.moves[randomNumber].move.url)
          .subscribe((move) => {
            movesArray.push(move);
            pokemon.moves.splice(randomNumber, 1);
            if (i >= 3) {
              const checkMovesTypeArray = movesArray.filter(
                (move: MoveData) => move.damage_class.name === 'status'
              );
              if (checkMovesTypeArray.length >= 3) {
                console.log('enters');
                const indexToDelete = movesArray.indexOf(
                  (move: MoveData) => move.damage_class.name === 'status'
                );
                movesArray.splice(indexToDelete, 1);
                i = i - 1;
              }
            }
            this.pokemonService.saveMovesInService(move);
            this.pokemonOpponentMoves = [...movesArray];
          });
      }
      this.pokemonOpponent = pokemon;
      this.pokemonOpponentHealthNumber =
        this.pokemonService.calculatePokemonsHealth(pokemon.stats[0].base_stat);
      this.pokemonOpponentHealthNumberTotal = this.pokemonOpponentHealthNumber;
      this.pokemonService.updateTurn(
        this.pokemonSpeed > this.pokemonOpponentSpeed ? 0 : 1
      );
    });

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
    this.pokemonService.getTypeInfo(move.type.url).subscribe((type) => {
      (async () => {
        this.effectivinessIndex =
          this.moveEffectivinessService.checkEffectiviness(
            type,
            this.pokemonOpponent.types
          );
        if (this.effectivinessIndex === 0) {
          this.boxMessage = 'noEffect';
          await wait(1000);
          return;
        }
        this.pokemonOpponentHealthNumber =
          this.pokemonService.calculateHealthAfterAttack(
            this.effectivinessIndex,
            this.pokemonOpponentHealthNumber,
            move.power
          );
        this.pokemonOpponentHealth =
          (this.pokemonOpponentHealthNumber /
            this.pokemonOpponentHealthNumberTotal) *
            100 +
          '%';
      })();
    });
  }

  opponentAttacks(move: MoveData) {
    this.pokemonService.getTypeInfo(move.type.url).subscribe((type) => {
      (async () => {
        this.effectivinessIndex =
        this.moveEffectivinessService.checkEffectiviness(
          type,
          this.pokemon.types
        );
        if (this.effectivinessIndex === 0) {
          this.boxMessage = 'noEffect';
          await wait(1000);
          return;
        }
      this.pokemonHealthNumber = this.pokemonService.calculateHealthAfterAttack(
        this.effectivinessIndex,
        this.pokemonHealthNumber,
        move.power
      );
      this.pokemonHealth =
        (this.pokemonHealthNumber / this.pokemonHealthNumberTotal) * 100 + '%';
      })();
    });

    this.opponentHasSelectedMove = false;
    // this.attack(move);
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
    if (this.pokemonHealthNumber > 0) {
      alert('You lose');
      return true;
    }
    if (this.pokemonOpponentHealthNumber > 0) {
      alert('You win');
      return true;
    }
    return false;
  }

  gameLoop(turn: number, move: MoveData) {
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
      turn === 0
        ? (this.pokemonClassName = 'attack')
        : (this.pokemonOpponentClassName = 'attack');
      await wait(100);
      turn === 0
        ? (this.pokemonClassName = '')
        : (this.pokemonOpponentClassName = '');
      await wait(500);
      turn === 0
        ? (this.pokemonOpponentClassName = 'damage')
        : (this.pokemonClassName = 'damage');
      await wait(600);
      this.pokemonOpponentClassName = '';
      this.pokemonClassName = '';
      turn === 0 ? this.attack(move) : this.opponentAttacks(move);

      await wait(1000);

      // if(turn === 1)this.boxMessage = 'chooseActionMessage';
      this.turnCount = this.turnCount + 1;
      if (this.turnCount === 2) {
        console.log('finish');
        this.hasSelectedMove = false;
        this.turnCount = 0;
        this.currentPokemonName = this.pokemon.name;
        this.boxMessage = 'chooseActionMessage';
      }
      await wait(100);
      turn === 0
        ? this.pokemonService.updateTurn(1)
        : this.pokemonService.updateTurn(0);
    })();
  } // falta modificar un poco las velocidades

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
