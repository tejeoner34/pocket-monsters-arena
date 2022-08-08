import { Component, OnInit } from '@angular/core';
import { Pokemon, PokemonEdit } from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { User } from 'src/app/interfaces/user.interface';
import { MoveEffectivinessService } from 'src/app/services/move-effectiviness.service';
import { PointsService } from 'src/app/services/points.service';
import { PokemonService } from 'src/app/services/pokemon.service';
import { UserService } from 'src/app/services/user.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
import { wait } from 'src/app/shared/helpers';

@Component({
  selector: 'app-online-arena',
  templateUrl: './online-arena.component.html',
  styleUrls: ['./online-arena.component.scss'],
})
export class OnlineArenaComponent implements OnInit {

  user!: User | null;


  pokemon!: PokemonEdit;
  pokemonClassName = '';
  pokemonOpponent!: PokemonEdit;
  pokemonOpponentClassName = '';
  currentPokemonName = '';
  httpMovesPetitionsCount: number = 0;
  opponentChosenMove!: MoveData;

  boxMessage = 'chooseActionMessage';
  usedMove = '';
  hasSelectedMove = false;
  opponentHasSelectedMove = false;
  chosenMove!: MoveData;
  movesContainerArray: HTMLElement[] = [];
  currentMovePosition = 0;

  effectivinessIndex = 1;
  gameOver = false;
  winner: string = '';
  opponentTextPlaceholder = '';

  currentTurn!: number;
  turnCount = 0;

  _userId!: string | null;

  constructor(
    private webSocket: WebSocketService,
    private pokemonService: PokemonService,
    private moveEffectivinessService: MoveEffectivinessService,
    private userService: UserService,
    private pointsService: PointsService
  ) {}

  ngOnInit(): void {
    this.webSocket.userId$.subscribe((res) => (this._userId = res));

    this.webSocket.listen('get-opponents-move').subscribe(res => {
      this.opponentChosenMove = res.find((element:any) => element.attackerId === this.webSocket.opponentId).moveData;
      console.log(this.opponentChosenMove);
      this.opponentHasSelectedMove = true;
      this.pokemonService.updateTurn(this.currentTurn);
    })

    //turn Observable
    this.pokemonService.turnObservable$.subscribe((turn) => {
      this.currentTurn = turn;
      console.log(this.currentTurn);

      if (this.currentTurn === 1 && this.hasSelectedMove && this.opponentHasSelectedMove) {
        const mostPowerFulAttack = this.pokemonService.getMostPowerfulAttack();
        const mostPowerfulMoveIndex =
          this.pokemonOpponent.pokemonMoves.findIndex(
            (move) => move.name.toLowerCase() === mostPowerFulAttack
          );
        this.gameLoop(
          this.currentTurn,
          this.opponentChosenMove
        );
      }
      if (this.currentTurn === 0 && this.hasSelectedMove && this.opponentHasSelectedMove) {
        this.gameLoop(this.currentTurn, this.chosenMove);
      }
    });

    //Get opponents pokemon data

    this.webSocket.listen('get-pokemon-data').subscribe(({ pokemon }) => {
      this.pokemonOpponent = pokemon;
      console.log(this.pokemonOpponent);
      if(this.pokemon) {
        this.pokemonService.calculateEachMoveDamage(
          this.pokemon.pokemonMoves,
          this.pokemonOpponent.types
        );
        this.pokemonService.updateTurn(
          this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
        );
      }
    });

    this.pokemonService.getRandomPokemon().subscribe((pokemon) => {
      //Pokemon data
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

  sendMessage(message: any) {
    // this.messages.push({message, id: this.webSocket.userId});
    this.webSocket.emit('send-message', {
      message: message.text,
      id: this._userId,
      arenaId: this.webSocket.roomId,
    });
  }

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

        //tengo que añadir una nueva funcion en el servicio que chequee la efectividad de los movimientos.
        // if (this.pokemon.pokemonMoves.length > 3) {
        //   this.pokemonService.calculateEachMoveDamage(
        //     this.pokemon.pokemonMoves,
        //     this.pokemonOpponent.types
        //   );
        //   return;
        // }
        this.webSocket.roomIsFull$.subscribe((res) => {
          if (res) {
            this.webSocket.emit('send-pokemon-data', {
              pokemon: this.pokemon,
              opponentUserId: this.webSocket.opponentId,
            });
            if(this.pokemonOpponent) {
              this.pokemonService.calculateEachMoveDamage(
                this.pokemon.pokemonMoves,
                this.pokemonOpponent.types
              );
              this.pokemonService.updateTurn(
                this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
              );
            }
          }
        });
      });
  }

  chooseMove(move: MoveData, i: number) {
    if (this.hasSelectedMove) return;
    this.chosenMove = move;
    this.hasSelectedMove = true;
    // this.movesContainerArray[this.currentMovePosition].classList.remove(
    //   'arrow'
    // );
    // this.currentMovePosition = i;
    // this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
    this.pokemonService.updateTurn(this.currentTurn);
    this.webSocket.emit('select-move', {
      moveData: move,
      attackerId: this._userId,
      receiverId: this.webSocket.opponentId,
      roomId: this.webSocket.roomId
    })
  }

  attack(move: MoveData) {
    (async () => {
      this.pokemonOpponent.pokemonHealthNumber =
        this.pokemonService.calculateHealthAfterAttack(
          this.effectivinessIndex,
          this.pokemonOpponent.pokemonHealthNumber!,
          move.power
        );
      this.pointsService.updateUserPoints(this.pokemonOpponent.pokemonHealthNumberTotal - this.pokemonOpponent.pokemonHealthNumber);
      if(this.user) {
        this.user.points = this.pointsService.getUserPoints();
        this.userService.updateUserData(this.user)
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
    console.log(this.effectivinessIndex)
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
      if(move.power === null) {
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
        ? this.attack(move) 
        : this.opponentAttacks(move);
      
      if(this.effectivinessIndex !== 1) {
        this.boxMessage = this.moveEffectivinessService.messageByEffectiviness(this.effectivinessIndex);
        await wait(1200);
      }

      await wait(1000);

      if (this.isGameOver(receiver.pokemonHealthNumber)) {
        if(turn === 0) {
          this.pokemonOpponentClassName = 'damage';
          await wait (1000);
          this.pokemonOpponentClassName = 'defeat';
          this.user !== null ? this.user.wins += 1 : null;
        } else {
          this.pokemonClassName = 'damage';
          await wait (1000);
          this.pokemonClassName = 'defeat';
          this.user !== null ? this.user.defeats += 1 : null;
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

  isGameOver(life: number) {
    return life <= 0 ? true : false;
  }
}
