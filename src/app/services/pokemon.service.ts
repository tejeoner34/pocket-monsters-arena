import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon } from '../interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) { }

  getRandomPokemon(): Observable<Pokemon> {
    const randomPokemonId = this.generateRandomNumber(1, 150);
    return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}/`);
  }

  getMovementInfo(url: string) {
    return this.http.get(url);
  }

  generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
