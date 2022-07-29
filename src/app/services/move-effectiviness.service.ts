import { Injectable } from '@angular/core';
import { Type } from '../interfaces/interfaces';
import { MoveData } from '../interfaces/movements.interface';
import { TypeData } from '../interfaces/type.interface';

type damageRelations = {
  double_damage_to: number;
  half_damage_to: number;
  no_damage_to: number;
  neutral: number;
}

type EffectMessages = {
  "1": string;
  "2": string;
  "0.5": string;
  "0": string
}

const messsages: EffectMessages = {
  "1": "",
  "2": "superEffective",
  "0.5": "notVeryEffective",
  "0": "noEffect"
}


@Injectable({
  providedIn: 'root'
})
export class MoveEffectivinessService {

  damageRelations: damageRelations = {
    double_damage_to: 2,
    half_damage_to: .5,
    no_damage_to: 0,
    neutral: 1,
  }

  constructor() { }

  checkEffectiviness(moveType: TypeData, pokemonTypes: Type[]) {

    let effectivenessIndex = 1;

    const damageRelationsArray = Object.entries(moveType.damage_relations).filter(([key, value]) => 
      key.includes('_to'));
    const mappedRelations = damageRelationsArray.map(relation => {
      return {
        relation: relation[0],
        types: [...relation[1]]
      }
    });

    const relationsToApply = [];

    for(let i = 0; i < mappedRelations.length; i++) {
      for(let j = 0; j< mappedRelations[i].types.length; j++) {
        for(let h = 0; h < pokemonTypes.length; h++) {
          if(pokemonTypes[h].type.name === mappedRelations[i].types[j].name) {
            relationsToApply.push(mappedRelations[i].relation)
          }
        }
        if(relationsToApply.length === pokemonTypes.length) break;
      }
      if(relationsToApply.length === pokemonTypes.length) break;
    }

    for(let i = 0; i < relationsToApply.length; i++){
      effectivenessIndex = effectivenessIndex * this.damageRelations[relationsToApply[i] as keyof damageRelations];
    }

    return effectivenessIndex;
  }

  hasMovedMissed(move: MoveData) {
    const accuracy = move.accuracy ?? 100 /  100;
    const random = Math.random();

    return random < accuracy ? false : true;
  }

  messageByEffectiviness(index: number) {
    const indextoString = index.toString();
    const message = messsages[indextoString as keyof EffectMessages];
    console.log(message)
    return message;
  }


}
