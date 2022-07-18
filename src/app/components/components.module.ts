import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeballComponent } from './pokeball/pokeball.component';
import { PokemonComponent } from './pokemon/pokemon.component';
import { GameOverModalComponent } from './game-over-modal/game-over-modal.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    PokeballComponent,
    PokemonComponent,
    GameOverModalComponent,
  ],
  exports: [
    PokeballComponent,
    PokemonComponent,
    GameOverModalComponent
    
  ],
  imports: [
    CommonModule,
    TranslateModule
  ]
})
export class ComponentsModule { }
