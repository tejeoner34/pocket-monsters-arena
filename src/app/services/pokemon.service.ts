import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Name, Pokemon, PokemonEdit, PokemonSpecies, Type } from '../interfaces/interfaces';
import { MoveData } from '../interfaces/movements.interface';
import { TypeData } from '../interfaces/type.interface';
import { TranslateService } from '@ngx-translate/core';
import { MoveEffectivinessService } from './move-effectiviness.service';
import { PointsService } from './points.service';

interface MovesDamage {
  opponent: MoveDamage[];
  pokemon: MoveDamage[]
}

type MoveDamage = {
  name: string;
  damage: number;
  index: number;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  turn$ = new BehaviorSubject(0);
  turnObservable$ = this.turn$.asObservable();
  _pokemonMoves: MoveData[] = [];
  _movesDamage: MovesDamage = {
    opponent: [],
    pokemon: []
  }
  turnsCounter = 0;

  constructor(
    private http: HttpClient, 
    private translateService: TranslateService,
    private moveService: MoveEffectivinessService,
    private pointsService: PointsService
    ) { }

  updateTurn(turn: number) {
    this.turn$.next(turn);
  }

  getRandomPokemon(): Observable<Pokemon> {
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

  getLocalizedPokemonMoves(move: MoveData) {
    const translatedMove = move.names.find((name: Name) => name.language.name === this.translateService.currentLang)?.name;
    return translatedMove ?? move.name;
  }

  getMovementInfo(url: string):Observable<MoveData> {
    return this.http.get<MoveData>(url);
  }

  saveMovesInService(moves: MoveData) {
    this._pokemonMoves.push(moves);
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

  calculateHealthAfterAttack(index: number, pokemonHealth: number, attackPower: number, isCritical = false, isMyUser = false) {
    if(isCritical) index = index * 2;
    
    const damage = this.calculateDamage(index, attackPower);
    if(isMyUser) {
      this.pointsService.updateDamagePoints(damage > pokemonHealth ? Math.floor(pokemonHealth) : Math.floor(damage));
    }
    const finalHealth = Math.floor(pokemonHealth - damage);
    if(finalHealth < 0) {
      return 0;
    }
    return finalHealth;
  }

  attack(move: MoveData, pokemonData: PokemonEdit, effectivinessIndex: number, isMyUser = false) {
    const pokemon = pokemonData;
    pokemon.pokemonHealthNumber =
      this.calculateHealthAfterAttack(
        effectivinessIndex,
        pokemon.pokemonHealthNumber,
        move.power,
        move.isCritical,
        isMyUser
      );
    pokemon.pokemonHealth =
      (pokemon.pokemonHealthNumber /
        pokemon.pokemonHealthNumberTotal) *
        100 +
      '%';
    return pokemon;
  }

  calculateDamage(index: number, attackPower: number) {
    return index * attackPower;
  }

  calculateEachMoveDamage(moves: MoveData[], opponentTypes: Type[], isOpponent: boolean = false) {
    
    if(isOpponent) {
      for(let i = 0; i < moves.length; i++){
        this.getTypeInfo(moves[i].type.url).subscribe(type => {
          let effectivinessIndex = this.moveService.checkEffectiviness(type, opponentTypes);
          const damage = this.calculateDamage(effectivinessIndex, moves[i].power);
          this._movesDamage.opponent.push({name: moves[i].name, damage: damage, index: effectivinessIndex});
        })
      }
    }

    if(!isOpponent) {
      for(let i = 0; i < moves.length; i++){
        this.getTypeInfo(moves[i].type.url).subscribe(type => {
          let effectivinessIndex = this.moveService.checkEffectiviness(type, opponentTypes);
          const damage = this.calculateDamage(effectivinessIndex, moves[i].power);
          this._movesDamage.pokemon.push({name: moves[i].name ,damage: damage, index: effectivinessIndex});
        })
      }
    }

  }

  getMostPowerfulAttack(attacks: MoveData[]) {
    if(this.turnsCounter >= 2) {
      this.turnsCounter = 0;
      return this.generateRandomNumber(0, 3);
    } else {
      this.turnsCounter += 1;
      let attackIndex = 0;
      let power = 0;
      attacks.forEach((attack, index) => {
        if(attack.power >= power) {
          power = attack.power;
          attackIndex = index;
        }
      });
      return attackIndex;
    }
    
  }

  getSelectedMoveEffectiviness(move: MoveData) {
    let index = 1;
    for(let i in this._movesDamage) {
      const foundIndex = this._movesDamage[i as keyof MovesDamage].find(movement => movement.name.toLowerCase() === move.name.toLowerCase())?.index;
      foundIndex === undefined 
        ? null 
        : index = foundIndex;
    }
    return index;
  }

  getMovesDamage() {
    return this._movesDamage;
  }

  generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  resetMovesDamage() {
    this._movesDamage = {
      opponent: [],
      pokemon: []
    }
  }
}
