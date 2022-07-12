import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon } from '../interfaces/interfaces';
import { MoveData } from '../interfaces/movements.interface';
import { TypeData } from '../interfaces/type.interface';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) { }

  getRandomPokemon(): Observable<Pokemon> {
    const randomPokemonId = this.generateRandomNumber(1, 150);
    return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}/`);
  }

  getMovementInfo(url: string):Observable<MoveData> {
    return this.http.get<MoveData>(url);
  }

  getTypeInfo(url: string): Observable<TypeData> {
    return this.http.get<TypeData>(url);
  }

  calculatePokemonsHealth(hpStat: number) {
    return Math.floor(0.01*(2*hpStat + 30 + Math.floor(0.25 * 500)) * 100) + 5;
  }

  calculateHealthAfterAttack(index: number, pokemonHealth: number, attackPower: number) {
    const damage = index * attackPower;
    const finalHealth = pokemonHealth - damage;
    if(finalHealth < 0) {
      return 0;
    }
    return finalHealth;
  }

  generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
