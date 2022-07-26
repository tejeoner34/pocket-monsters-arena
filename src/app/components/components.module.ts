import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeballComponent } from './pokeball/pokeball.component';
import { PokemonComponent } from './pokemon/pokemon.component';
import { GameOverModalComponent } from './game-over-modal/game-over-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { PokeballSpinnerComponent } from './pokeball-spinner/pokeball-spinner.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material/material.module';
import { UserDataComponent } from './user-data/user-data.component';



@NgModule({
  declarations: [
    PokeballComponent,
    PokemonComponent,
    GameOverModalComponent,
    PokeballSpinnerComponent,
    LoginFormComponent,

  ],
  exports: [
    PokeballComponent,
    PokemonComponent,
    GameOverModalComponent,
    PokeballSpinnerComponent,
    LoginFormComponent,
    
  ],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class ComponentsModule { }
