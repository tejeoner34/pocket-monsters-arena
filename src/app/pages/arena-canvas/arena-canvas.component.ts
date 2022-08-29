import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  Pokemon,
  PokemonEdit,
  PokemonSpecies,
} from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { PokemonService } from 'src/app/services/pokemon.service';
import {
  LifeContainer,
  PokemonClass,
} from '../../shared/game-classes/game-classes';
import { gsap } from 'gsap';
import { TranslateService } from '@ngx-translate/core';
import { wait } from 'src/app/shared/helpers';
import { MoveEffectivinessService } from 'src/app/services/move-effectiviness.service';
import { RestartService } from 'src/app/services/restart.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user.interface';
import { PointsService } from 'src/app/services/points.service';

@Component({
  selector: 'app-arena-canvas',
  templateUrl: './arena-canvas.component.html',
  styleUrls: ['./arena-canvas.component.scss'],
})
export class ArenaCanvasComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
  user!: User | null;
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
  pointsPerWin = 1000;

  effectivinessIndex = 1;

  constructor(
    private pokemonService: PokemonService,
    private translateService: TranslateService,
    private moveEffectivinessService: MoveEffectivinessService,
    private restartService: RestartService,
    private userService: UserService,
    private pointsService: PointsService
  ) {}

  ngOnInit(): void {
    this.restartService.restart$.subscribe((res) =>
      this.restartService.resetPage('arena-canvas')
    );

    this.translateService.get('ARENA').subscribe((data) => {
      this.opponentTextPlaceholder = data.opponent;
    });

    this.userService.user$.subscribe((res) => (this.user = res));

    this.pokemonService.turnObservable$.subscribe((turn) => {
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
      };
      this.pokemonInstance = new PokemonClass(
        { x: 50, y: 225 },
        this.pokemonImg,
        'pepe',
        false
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
        this.pokemon.pokemonHealthNumberTotal /
          this.pokemon.pokemonHealthNumberTotal,
        this.pokemon.pokemonHealthNumberTotal,
        this.pokemon.pokemonHealthNumber,
        this.ctx,
        {
          x: 400,
          y: 250,
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
        this.pokemonOpponentImg.src = 'assets/img/ghost-pokemon.png';
      };
      this.pokemonOpponentIntance = new PokemonClass(
        { x: 550, y: 50 },
        this.pokemonOpponentImg,
        'pepe',
        true
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
        this.pokemonOpponent.pokemonHealthNumberTotal /
          this.pokemonOpponent.pokemonHealthNumberTotal,
        this.pokemonOpponent.pokemonHealthNumberTotal,
        this.pokemonOpponent.pokemonHealthNumber,
        this.ctx,
        {
          x: 20,
          y: 30,
        },
        true
      );

      this.getPokemonMoves(this.pokemonOpponent, true);
      this.pokemonService.updateTurn(
        this.pokemon.pokemonSpeed > this.pokemonOpponent.pokemonSpeed ? 0 : 1
      );

      this.animate();
      setTimeout(() => {
        this.openPokeball = true;
      }, 800);
    });
  }

  ngOnDestroy(): void {
    this.pokemonService.resetMovesDamage();
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
    this.chosenMove = {
      ...move,
      isCritical: this.moveEffectivinessService.isCriticalMove(),
    };
    this.hasSelectedMove = true;
    // this.movesContainerArray[this.currentMovePosition].classList.remove(
    //   'arrow'
    // );
    // this.currentMovePosition = i;
    // this.movesContainerArray[this.currentMovePosition].classList.add('arrow');
    this.pokemonService.updateTurn(this.currentTurn);
  }

  attack(move: MoveData) {
    (async () => {
      this.pokemonOpponent.pokemonHealthNumber =
        this.pokemonService.calculateHealthAfterAttack(
          this.effectivinessIndex,
          this.pokemonOpponent.pokemonHealthNumber!,
          move.power,
          move.isCritical,
          true
        );
      this.pokemonOpponentLifecontainer.updateLife(
        this.pokemonOpponent.pokemonHealthNumber /
          this.pokemonOpponent.pokemonHealthNumberTotal
      );
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

      this.pokemonLifecontainer.updateLife(
        this.pokemon.pokemonHealthNumber / this.pokemon.pokemonHealthNumberTotal
      );
    })();

    this.opponentHasSelectedMove = false;
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
      await wait(1200);

      if (this.effectivinessIndex === 0) {
        await wait(1000);
        this.boxMessage = 'noEffect';
        await wait(1200);
        this.goToNextTurn(turn);
        return;
      }

      turn === 0
        ? this.pokemonInstance.attack(this.pokemonOpponentIntance)
        : this.pokemonOpponentIntance.attack(this.pokemonInstance);
      await wait(1200);

      if (this.moveEffectivinessService.hasMovedMissed(move)) {
        this.boxMessage = 'moveMissed';
        await wait(1200);
        this.goToNextTurn(turn);
        return;
      }

      if (move.power === null) {
        this.boxMessage = 'withoutEffect';
        await wait(1200);
        this.goToNextTurn(turn);
        return;
      }

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
          this.pokemonOpponentIntance.defeat();
          if(this.user) {
            this.user.wins += 1;
            this.user.points += this.pointsPerWin;
          }
        } else {
          this.pokemonInstance.defeat();
          this.user !== null ? (this.user.defeats += 1) : null;
        }
        this.userService.patchUserData(this.user!).subscribe();
        // turn === 0
        //   ? (this.pokemonOpponentIntance.defeat())
        //   : (this.pokemonInstance.defeat())
        await wait(1000);
        this.currentPokemonName = receiver.name;
        this.boxMessage = 'defeat';
        this.winner = attacker.name;
        await wait(1000);
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
