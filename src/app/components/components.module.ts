import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeballComponent } from './pokeball/pokeball.component';
import { PokemonComponent } from './pokemon/pokemon.component';



@NgModule({
  declarations: [
    PokeballComponent,
    PokemonComponent,
  ],
  exports: [
    PokeballComponent,
    PokemonComponent,
    
  ],
  imports: [
    CommonModule,
  ]
})
export class ComponentsModule { }
