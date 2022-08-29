import { AfterViewChecked, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { KEY_CODE, Pokemon, PokemonEdit } from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { User } from 'src/app/interfaces/user.interface';
import { MoveEffectivinessService } from 'src/app/services/move-effectiviness.service';
import { PointsService } from 'src/app/services/points.service';
import { PokemonService } from 'src/app/services/pokemon.service';
import { RestartService } from 'src/app/services/restart.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { wait } from 'src/app/shared/helpers';

@Component({
  selector: 'app-online-arena',
  templateUrl: './online-arena.component.html',
  styleUrls: ['./online-arena.component.scss'],
})
export class OnlineArenaComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('movesContainer') movesContainer!: ElementRef;

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    this.webSocket.emit('leave-room', {
      userId: this._userId,
      roomId: this.webSocket.roomId
    });
    // this.webSocket.setRoomIsFull(false);
    this.webSocket.setChallengerData(null);
  }

  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    this.onMoveArrow(event);
  }

  @HostListener('document:click', ['$event.target'])
  onClick(target: any) {
    const clickedInside = this.movesContainer.nativeElement.contains(target);
    if(!clickedInside) this.movesContainerOpen = false;
  }
  user!: User | null;

  pokemon!: PokemonEdit;
  pokemonClassName = '';
  pokemonOpponent!: PokemonEdit;
  pokemonOpponentClassName = '';
  currentPokemonName = '';
  httpMovesPetitionsCount: number = 0;
  opponentChosenMove!: MoveData;

  rivalDisconnect$!: Subscription;
  pokemonOpponent$!: Subscription;
  pokemon$!: Subscription;
  opponentMoves$!: Subscription;
  roomIsFull$!: Subscription;
  timerStarts$!: Subscription;
  timer$!: Subscription;
  gameOver$!: Subscription;
  restart$!: Subscription;
  pokemonsSpeed$!: Subscription;
  isTurnOver$!: Observable<boolean>;

  boxMessage = 'chooseActionMessage';
  usedMove = '';
  hasSelectedMove = false;
  opponentHasSelectedMove = false;
  chosenMove!: MoveData;
  movesContainerArray: HTMLElement[] = [];
  currentMovePosition = 0;
  timeToChoose = 20;
  movesContainerOpen: boolean = false;

  effectivinessIndex = 1;
  gameOver = false;
  winner: string = '';
  opponentTextPlaceholder = '';
  pointsPerWin = 3000;
  wantRemach: boolean = false;

  currentTurn!: number;
  turnCount = 0;
  waitingForRival = false;

  _userId!: string | null;

  constructor(
    public webSocket: WebSocketService,
    private pokemonService: PokemonService,
    private moveEffectivinessService: MoveEffectivinessService,
    private userService: UserService,
    private pointsService: PointsService,
    private translateService: TranslateService,
    private restartService: RestartService
  ) {}

  ngOnInit(): void {

    this.translateService.get('ARENA').subscribe((data) => {
      this.opponentTextPlaceholder = data.opponent;
    });

    this.isTurnOver$ = this.webSocket.listen('get-turn-over');

    this.restart$ = this.restartService.restart$.subscribe((res) => {
      this.wantRemach = true;
      this.restartService.resetPage(`online-arena/${this.webSocket.roomId}`);
    }
    );

    this.userService.user$.subscribe((res) => (this.user = res));

    this.webSocket.userId$.subscribe((res) => (this._userId = res));

    this.timerStarts$ = this.webSocket.listen('get-timer').subscribe(res =>{
      if(res.seconds) {
        this.timeToChoose = res.seconds;
        this.webSocket.startTimer(res.seconds);
      }
    });

    this.timer$ = this.webSocket.timer$.subscribe(time => {
      this.timeToChoose = time;
      if(this.timeToChoose === 0) {
        this.webSocket.emit('game-over', {userId: this._userId, roomId: this.webSocket.roomId});
        this.winner = this.pokemonOpponent.name;
        this.gameOver = true;
        this.webSocket.emit('reset-users-in-room', this.webSocket.roomId);
        this.user ? (this.user.defeats += 1) : null;
      }
    });

    this.gameOver$ = this.webSocket.listen('get-game-over').subscribe(res => {
      if(res.userId) {
        this.winner = this.pokemon.name;
        this.gameOver = true;
        if(this.user) {
          this.user.wins += 1;
          this.user.points += this.pointsPerWin;
        }
      }
    });

    this.pokemonsSpeed$ = this.webSocket.listen('get-turn').subscribe(res => {
      this.pokemonService.updateTurn(
        res[this._userId!]
      );
    });

    this.opponentMoves$ = this.webSocket.listen('get-opponents-move').subscribe((res) => {
      this.opponentChosenMove = res;
      this.opponentHasSelectedMove = true;
      this.pokemonService.updateTurn(this.currentTurn);
    });

    this.rivalDisconnect$ = this.webSocket.listen('rival-disconnect').subscribe(res => {
      if(res.disconnect) {
        this.webSocket.setRivalDisconnect(true);
        this.webSocket.setChallengerData(null);
      }
    });

    //turn Observable
    this.pokemonService.turnObservable$.subscribe((turn) => {
      this.currentTurn = turn;

      if (
        this.currentTurn === 1 &&
        this.hasSelectedMove &&
        this.opponentHasSelectedMove
      ) {
        this.gameLoop(this.currentTurn, this.opponentChosenMove);
      }
      if (
        this.currentTurn === 0 &&
        this.hasSelectedMove &&
        this.opponentHasSelectedMove
      ) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    });

    //Get opponents pokemon data

    this.pokemonOpponent$ = this.webSocket.listen('get-pokemon-data').subscribe(({ pokemon }) => {
      this.pokemonOpponent = pokemon;

      if (this.pokemon) {
        this.pokemonService.calculateEachMoveDamage(
          this.pokemon.pokemonMoves,
          this.pokemonOpponent.types
        );
      }
      if (this.pokemonOpponent) {
        this.pokemonService.calculateEachMoveDamage(
          this.pokemonOpponent.pokemonMoves,
          this.pokemon.types,
          true
        );
        if(this.pokemon.pokemonSpeed === this.pokemonOpponent.pokemonSpeed) {
          if(this.pokemon.weight !== this.pokemonOpponent.weight) {
            this.pokemonService.updateTurn(
              this.pokemon.weight > this.pokemonOpponent.weight ? 0 : 1
            );
          } else {
            // in this case the pokemons are the same so I call an event that emits the turn number
            this.webSocket.emit('pokemon-speed-equal', {
              userId : this._userId,
              roomId : this.webSocket.roomId
            });
          }
        } else {
          this.pokemonService.updateTurn(
            this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
          );
        }
      }
    });

    //Send our pokemon data
    this.roomIsFull$ = this.webSocket.listen('all-users-in-room').subscribe(res => {
      if (res.roomComplete) {
        this.webSocket.emit('send-pokemon-data', {
          pokemon: this.pokemon,
          opponentUserId: this.webSocket.opponentId,
        });
      }
    }
    );

    this.pokemon$ = this.pokemonService.getRandomPokemon().subscribe((pokemon) => {
      this.pokemonService
        .getLocalizedPokemonName(pokemon.id)
        .subscribe((name) => {
          this.pokemon.name = name;
          this.currentPokemonName = name;
        });
      this.pokemon = {
        ...pokemon,
        pokemonMoves: [],
        pokemonHealth: '100%',
        pokemonSpeed: pokemon.stats[5].base_stat,
        pokemonHealthNumber: this.pokemonService.calculatePokemonsHealth(
          pokemon.stats[0].base_stat
        ),
        pokemonHealthNumberTotal: this.pokemonService.calculatePokemonsHealth(
          pokemon.stats[0].base_stat
        ),
      };

      this.getPokemonMoves(this.pokemon);
    });
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
    this.rivalDisconnect$.unsubscribe();
    this.pokemonOpponent$.unsubscribe();
    this.pokemon$.unsubscribe();
    this.opponentMoves$.unsubscribe();
    this.roomIsFull$.unsubscribe();
    this.timerStarts$.unsubscribe();
    this.timer$.unsubscribe();
    this.gameOver$.unsubscribe();
    this.restart$.unsubscribe();
    this.pokemonsSpeed$.unsubscribe();
    if(!this.wantRemach) {
      this.webSocket.emit('leave-room', {
        userId: this._userId,
        roomId: this.webSocket.roomId
      });
      this.webSocket.setChallengerData(null);
    }
  }

  // sendMessage(message: any) {
  //   // this.messages.push({message, id: this.webSocket.userId});
  //   this.webSocket.emit('send-message', {
  //     message: message.text,
  //     id: this._userId,
  //     arenaId: this.webSocket.roomId,
  //   });
  // }

  getPokemonMoves(pokemon: Pokemon, isOpponent = false) {
    if (this.pokemon.pokemonMoves.length > 3) return;
    const randomNumber = this.pokemonService.generateRandomNumber(
      0,
      pokemon.moves.length - 1
    );
    this.pokemonService
      .getMovementInfo(pokemon.moves[randomNumber].move.url)
      .subscribe((move) => {
        let movesArray = [];
        this.httpMovesPetitionsCount = this.httpMovesPetitionsCount + 1;
        const petitionsDone = this.httpMovesPetitionsCount;
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

        // At this point we have pokemon data so we join the room.
        this.webSocket.emit('join-room', {
          userId: this._userId,
          roomId: this.webSocket.roomId,
        });
      });
  }

  chooseMove(move: MoveData, i: number) {
    if (this.hasSelectedMove) return;
    this.webSocket.stopTimer();
    this.waitingForRival = true;
    this.chosenMove = {
      ...move,
      hasMoveMissed: this.moveEffectivinessService.hasMovedMissed(move),
      isCritical: this.moveEffectivinessService.isCriticalMove(),
    };
    this.hasSelectedMove = true;
    this.movesContainerArray[this.currentMovePosition].classList.remove(
      'arrow'
    );
    this.currentMovePosition = i;
    this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
    this.pokemonService.updateTurn(this.currentTurn);
    
    this.webSocket.emit('select-move', {
      moveData: this.chosenMove,
      attackerId: this._userId,
      receiverId: this.webSocket.opponentId,
      roomId: this.webSocket.roomId,
    });

    if(!this.opponentHasSelectedMove) {
      this.webSocket.emit('set-timer', {
        userId: this.webSocket.opponentId,
        roomId: this.webSocket.roomId
      });
    }
  }

  attack(move: MoveData) {
    (async () => {
      this.pokemonOpponent.pokemonHealthNumber =
        this.pokemonService.calculateHealthAfterAttack(
          this.effectivinessIndex,
          this.pokemonOpponent.pokemonHealthNumber!,
          move.power,
          move.isCritical
        );
      if (this.user) {
        this.user.points = this.pointsService.getUserPoints();
        this.userService.updateUserData(this.user);
      }
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
          move.power,
          move.isCritical
        );
      this.pokemon.pokemonHealth =
        (this.pokemon.pokemonHealthNumber /
          this.pokemon.pokemonHealthNumberTotal) *
          100 +
        '%';
    })();
  }

  gameLoop(turn: number, move: MoveData) {
    this.waitingForRival = false;
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
      if (move?.hasMoveMissed) {
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
      turn === 0 ? this.attack(move) : this.opponentAttacks(move);
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
          this.user ? (this.user.defeats += 1) : null;
        }
        this.userService.patchUserData(this.user!).subscribe();
        this.webSocket.emit('reset-users-in-room', this.webSocket.roomId);
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
      this.opponentHasSelectedMove = false;
      this.turnCount = 0;
      this.webSocket.emit('turn-over',{
        userId: this._userId,
        roomId: this.webSocket.roomId
      });
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
