import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Name, Pokemon, PokemonSpecies } from '../interfaces/interfaces';
import { MoveData } from '../interfaces/movements.interface';
import { TypeData } from '../interfaces/type.interface';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  turn$ = new BehaviorSubject(0);
  turnObservable$ = this.turn$.asObservable();
  _pokemonMoves: MoveData[] = [];

  constructor(private http: HttpClient, private translateService: TranslateService) { }

  updateTurn(turn: number) {
    this.turn$.next(turn);
  }

  getRandomPokemon(): Observable<Pokemon> {
    console.log(this.translateService.currentLang)
    const randomPokemonId = this.generateRandomNumber(1, 150);
    return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}/`);
  }

  getLocalizedPokemonName(pokemonId: number): Observable<string> {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`).pipe(
      map((pokemon: any) => {
        const pokemonName = pokemon.names.find((name: Name) => name.language.name === this.translateService.currentLang)?.name;
        return pokemonName
      })
    );
  }

  getMovementInfo(url: string):Observable<MoveData> {
    return this.http.get<MoveData>(url);
  }

  saveMovesInService(moves: MoveData) {
    this._pokemonMoves.push(moves);
    console.log(this._pokemonMoves)
  }

  getServiceMoves() {
    return [...this._pokemonMoves];
  }

  getTypeInfo(url: string): Observable<TypeData> {
    return this.http.get<TypeData>(url);
  }

  calculatePokemonsHealth(hpStat: number) {
    return Math.floor(0.01*(2*hpStat + 30 + Math.floor(0.25 * 500)) * 100) + 5;
  }

  calculateHealthAfterAttack(index: number, pokemonHealth: number, attackPower: number) {
    const damage = index * attackPower;
    const finalHealth = Math.floor(pokemonHealth - damage);
    if(finalHealth < 0) {
      return 0;
    }
    return finalHealth;
  }

  generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
