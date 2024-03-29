import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, ReplaySubject, takeUntil } from 'rxjs';
import { KEY_CODE, Pokemon, PokemonEdit } from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { User } from 'src/app/interfaces/user.interface';
import { PokemonService } from 'src/app/services/pokemon.service';
import { RestartService } from 'src/app/services/restart.service';
import { UserService } from 'src/app/services/user.service';
import { wait } from 'src/app/shared/helpers';
import { MoveEffectivinessService } from '../../services/move-effectiviness.service';

@Component({
  selector: 'app-arena',
  templateUrl: './arena.component.html',
  styleUrls: ['./arena.component.scss'],
})
export class ArenaComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('movesContainer') movesContainer!: ElementRef;
  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    this.onMoveArrow(event);
  }

  @HostListener('document:click', ['$event.target'])
  onClick(target: any) {
    const clickedInside = this.movesContainer.nativeElement.contains(target);
    if(!clickedInside) this.movesContainerOpen = false;
  }

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  user!: User | null;
  openPokeball: boolean = false;
  pokemon!: PokemonEdit;
  pokemonOpponent!: PokemonEdit;
  boxMessage = 'chooseActionMessage';
  usedMove = '';
  currentPokemonName = '';
  hasSelectedMove = false;
  opponentHasSelectedMove = false;
  chosenMove!: MoveData;
  movesContainerOpen: boolean = false;
  pokemonClassName = '';
  pokemonOpponentClassName = '';
  pokemonMovesLoaded: boolean = false;
  pokemonOpponentMovesLoaded: boolean = false
  currentTurn!: number;
  turnCount = 0;
  movesContainerArray: HTMLElement[] = [];
  currentMovePosition = 0;
  opponentTextPlaceholder = '';
  petitionsCount: number = 0;
  petitionsCountOpponent: number = 0;
  winner: string = '';
  gameOver = false;
  pointsPerWin = 1000;

  effectivinessIndex = 1;

  constructor(
    private pokemonService: PokemonService,
    private moveEffectivinessService: MoveEffectivinessService,
    public translateService: TranslateService,
    private userService: UserService,
    private restartService: RestartService
  ) {}

  ngOnInit(): void {
    this.restartService.restart$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => this.restartService.resetPage('arena'));

    this.translateService.get('ARENA').subscribe((data) => {
      this.opponentTextPlaceholder = data.opponent;
    });

    this.userService.user$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((res) => (this.user = res));

    this.pokemonService.turnObservable$
      .pipe(takeUntil(this.destroyed$))
      .subscribe((turn) => {
      this.currentTurn = turn;

      if (this.currentTurn === 1 && this.hasSelectedMove) {
        const attackIndex = this.pokemonService.getMostPowerfulAttack(this.pokemonOpponent.pokemonMoves);
        this.pokemonOpponent.pokemonMoves[attackIndex] = {
          ...this.pokemonOpponent.pokemonMoves[attackIndex],
          isCritical: this.moveEffectivinessService.isCriticalMove(),
        };
        this.gameLoop(
          this.currentTurn,
          this.pokemonOpponent.pokemonMoves[attackIndex]
        );
      }
      if (this.currentTurn === 0 && this.hasSelectedMove) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    });

    forkJoin([
      this.pokemonService.getRandomPokemon(),
      this.pokemonService.getRandomPokemon(),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((pokemons) => {
      //Pokemon data
      this.pokemonService.getLocalizedPokemonName(pokemons[0].id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((name) => {
          this.pokemon.name = name;
          this.currentPokemonName = name;
        });

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
      this.pokemon.moves.length <= 4 
        ? this.getPokemonMovesShortArray(this.pokemon)
        : this.getPokemonMoves(this.pokemon); 


      // Opponent data
      this.pokemonService.getLocalizedPokemonName(pokemons[1].id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((name) => (this.pokemonOpponent.name = name));

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

      this.pokemonOpponent.moves.length <= 4 
        ? this.getPokemonMovesShortArray(this.pokemonOpponent, true)
        : this.getPokemonMoves(this.pokemonOpponent, true); 

      this.pokemonService.updateTurn(
        this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
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

  ngOnDestroy(): void {
    this.pokemonService.resetMovesDamage();
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  getPokemonMoves(pokemon: Pokemon, isOpponent = false) {
    if (!isOpponent && this.pokemon.pokemonMoves.length > 3) return;
    if (isOpponent && this.pokemonOpponent.pokemonMoves.length > 3) return;
    const randomNumber = this.pokemonService.generateRandomNumber(
      0,
      pokemon.moves.length - 1
    );
    this.pokemonService.getMovementInfo(pokemon.moves[randomNumber].move.url)
      .pipe(takeUntil(this.destroyed$))
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
            this.pokemonOpponentMovesLoaded = true;
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
            this.pokemonMovesLoaded = true;
            return;
          }
        }
      });
  }

  //situation in which moves array is 4 or less
  getPokemonMovesShortArray(pokemon: Pokemon, isOpponent = false) {
    if (!isOpponent && this.pokemon.pokemonMoves.length > 3) return;
    if (isOpponent && this.pokemonOpponent.pokemonMoves.length > 3) return;
    for(let i = 0; i < pokemon.moves.length; i++) {
      this.pokemonService.getMovementInfo(pokemon.moves[i].move.url)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((move) => {
        if (isOpponent) {
          move.name = this.pokemonService.getLocalizedPokemonMoves(move);
          this.pokemonOpponent.pokemonMoves.push(move);
          this.pokemonService.saveMovesInService(move);
          if (i === pokemon.moves.length - 1) {
            this.pokemonService.calculateEachMoveDamage(
              this.pokemonOpponent.pokemonMoves,
              this.pokemon.types,
              true
            );
            this.pokemonOpponentMovesLoaded = true;
            return;
          }
        }
        if (!isOpponent) {
          move.name = this.pokemonService.getLocalizedPokemonMoves(move);
          this.pokemon.pokemonMoves.push(move);
          this.pokemonService.saveMovesInService(move);
          if (i === pokemon.moves.length - 1) {
            this.pokemonService.calculateEachMoveDamage(
              this.pokemon.pokemonMoves,
              this.pokemonOpponent.types
            );
            this.pokemonMovesLoaded = true;
            return;
          }
        }
      });
    }
    
  }

  chooseMove(move: MoveData, i: number) {
    if (this.hasSelectedMove) return;
    this.chosenMove = move;
    this.chosenMove = {
      ...move,
      isCritical: this.moveEffectivinessService.isCriticalMove(),
    };
    this.hasSelectedMove = true;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = i;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
    this.pokemonService.updateTurn(this.currentTurn);
  }

  isGameOver(life: number) {
    return life <= 0 ? true : false;
  }

  gameLoop(turn: number, move: MoveData) {
    this.effectivinessIndex =
      this.pokemonService.getSelectedMoveEffectiviness(move);
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
        await wait(1200);
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
        await wait(1000);
        this.goToNextTurn(turn);
        return;
      }
      if (move.power === null) {
        this.boxMessage = 'withoutEffect';
        await wait(1000);
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
      turn === 0 
        ? this.pokemonOpponent = this.pokemonService.attack(move, this.pokemonOpponent, this.effectivinessIndex, true) 
        : this.pokemon = this.pokemonService.attack(move, this.pokemon, this.effectivinessIndex);
      if (this.effectivinessIndex !== 1 && !move.isCritical) {
        this.boxMessage = this.moveEffectivinessService.messageByEffectiviness(
          this.effectivinessIndex
        );
        await wait(1200);
      } else if (move.isCritical) {
        this.boxMessage = 'criticalHit';
        await wait(1200);
      }

      await wait(1000);

      if (this.isGameOver(receiver.pokemonHealthNumber)) {
        if (turn === 0) {
          this.pokemonOpponentClassName = 'damage';
          await wait(1000);
          this.pokemonOpponentClassName = 'defeat';
          if (this.user) {
            this.user.wins += 1;
            this.user.points += this.pointsPerWin;
          }
        } else {
          this.pokemonClassName = 'damage';
          await wait(1000);
          this.pokemonClassName = 'defeat';
          this.user !== null ? (this.user.defeats += 1) : null;
        }
        this.userService.patchUserData(this.user!).subscribe();
        this.currentPokemonName = receiver.name;
        this.boxMessage = 'defeat';
        this.winner = attacker.name;
        await wait(1000);
        this.gameOver = true;
        this.hasSelectedMove = false;
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

    if (keycode === KEY_CODE.SPACE) {
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
    if (this.currentMovePosition === 2 || this.currentMovePosition === 3)
      return;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = this.currentMovePosition + 2;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
  }

  onPressEnter() {
    const move = this.pokemon.pokemonMoves.find(
      (move) =>
        move.name.toLowerCase() ===
        this.movesContainerArray[
          this.currentMovePosition
        ].textContent?.toLowerCase()
    );
    if (move !== undefined) {
      this.chooseMove(move, this.currentMovePosition);
    }
  }
}
