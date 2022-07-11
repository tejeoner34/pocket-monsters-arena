import { Injectable } from '@angular/core';
import { Type } from '../interfaces/interfaces';
import { TypeData } from '../interfaces/type.interface';

type damageRelations = {
  double_damage_to: number;
  half_damage_to: number;
  no_damage_to: number;
  neutral: number;
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
    console.log(pokemonTypes);

    const damageRelationsArray = Object.entries(moveType.damage_relations).filter(([key, value]) => 
      key.includes('_to'));
    const mappedRelations = damageRelationsArray.map(relation => {
      return {
        relation: relation[0],
        types: [...relation[1]]
      }
    });
    console.log(mappedRelations);

    const relationsToApply = [];

    for(let i = 0; i < mappedRelations.length; i++) {
      for(let j = 0; j< mappedRelations[i].types.length; j++) {
        for(let h = 0; h < pokemonTypes.length; h++) {
          console.log(mappedRelations[i])
          if(pokemonTypes[h].type.name === mappedRelations[i].types[j].name) {
            relationsToApply.push(mappedRelations[i].relation)
          }
        }
      }
    }

    console.log(relationsToApply);
    // if(pokemonTypes.length === 1) {
    //   let relation = mappedRelations.find(element => element.types.filter(type => type.name === pokemonTypes[0].type.name));
    //   if(relation === undefined) return this.damageRelations['neutral'];
    //   console.log(relation)
    //   return this.damageRelations[relation.relation as keyof damageRelations];
    // }else {

    // }

    return
  }


}
