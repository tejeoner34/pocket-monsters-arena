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
import { TopUsersComponent } from './top-users/top-users.component';
import { PipeModule } from '../shared/pipes/pipe.module';
import { ShowUsersButtonComponent } from './show-users-button/show-users-button.component';
import { ChallengedModalComponent } from './challenged-modal/challenged-modal.component';
import { RivalDisconnectComponent } from './rival-disconnect/rival-disconnect.component';
import { TimerComponent } from './timer/timer.component';
import { MovesContainerComponent } from './moves-container/moves-container.component';
import { ErrorModalComponent } from './error-modal/error-modal.component';



@NgModule({
  declarations: [
    PokeballComponent,
    PokemonComponent,
    GameOverModalComponent,
    PokeballSpinnerComponent,
    LoginFormComponent,
    TopUsersComponent,
    ShowUsersButtonComponent,
    ChallengedModalComponent,
    RivalDisconnectComponent,
    TimerComponent,
    MovesContainerComponent,
    ErrorModalComponent,

  ],
  exports: [
    PokeballComponent,
    PokemonComponent,
    GameOverModalComponent,
    PokeballSpinnerComponent,
    LoginFormComponent,
    TopUsersComponent,
    ShowUsersButtonComponent,
    ChallengedModalComponent,
    RivalDisconnectComponent,
    TimerComponent,
    MovesContainerComponent,
    ErrorModalComponent
    
  ],
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    MaterialModule,
    PipeModule
  ]
})
export class ComponentsModule { }
