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

@Component({
  selector: 'app-arena-canvas',
  templateUrl: './arena-canvas.component.html',
  styleUrls: ['./arena-canvas.component.scss'],
})
export class ArenaCanvasComponent implements OnInit {
  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;
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
  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
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
        this.ctx,
        {
          x: 400,
          y: 250
        }
      );
      // this.getPokemonMoves(this.pokemon);

      // Opponent data
      this.pokemonService
        .getLocalizedPokemonName(pokemons[1].id)
        .subscribe((name) => { 
          this.pokemonOpponent.name = name;
          this.pokemonOpponentLifecontainer.updateName(name);
        });

      this.pokemonOpponentImg.src = pokemons[1].sprites.front_default;
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
        this.ctx,
        {
          x: 20,
          y: 30
        }
      );

      // this.getPokemonMoves(this.pokemonOpponent, true);
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

  move() {
    this.pokemonLifecontainer.updateLife(0.5);
  }
}
