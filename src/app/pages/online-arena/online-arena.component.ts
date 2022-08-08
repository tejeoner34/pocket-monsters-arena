import { Component, OnInit } from '@angular/core';
import { Pokemon, PokemonEdit } from 'src/app/interfaces/interfaces';
import { MoveData } from 'src/app/interfaces/movements.interface';
import { PokemonService } from 'src/app/services/pokemon.service';
import { WebSocketService } from 'src/app/services/web-socket.service';

@Component({
  selector: 'app-online-arena',
  templateUrl: './online-arena.component.html',
  styleUrls: ['./online-arena.component.scss'],
})
export class OnlineArenaComponent implements OnInit {
  pokemon!: PokemonEdit;
  pokemonClassName = '';
  pokemonOpponent!: PokemonEdit;
  pokemonOpponentClassName = '';
  currentPokemonName = '';
  httpMovesPetitionsCount: number = 0;

  boxMessage = 'chooseActionMessage';
  usedMove = '';
  hasSelectedMove = false;
  chosenMove!: MoveData;
  movesContainerArray: HTMLElement[] = [];
  currentMovePosition = 0;

  currentTurn!: number;

  _userId!: string | null;

  constructor(
    private webSocket: WebSocketService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.webSocket.userId$.subscribe((res) => (this._userId = res));
    // this.webSocket.listen('get message').subscribe(console.log);

    // this.webSocket.roomIsFull$.subscribe(res => {
    //   console.log(res)
    //   if(res === true) {
    //     this.webSocket.emit('send-pokemon-data', {
    //       pokemon: this.pokemon,
    //       opponentUserId: this.webSocket.opponentId
    //     }); 
    //   }
    // })

    //Get opponents pokemon data

    this.webSocket.listen('get-pokemon-data').subscribe(({pokemon}) => {
      this.pokemonOpponent = pokemon;
      console.log(pokemon);
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
          this.webSocket.roomIsFull$.subscribe(res => {
            if(res){
              this.webSocket.emit('send-pokemon-data', {
                pokemon: this.pokemon,
                opponentUserId: this.webSocket.opponentId
              }); 
            }
          })
          
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
}
