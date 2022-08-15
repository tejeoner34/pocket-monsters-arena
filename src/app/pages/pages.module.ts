import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ArenaComponent } from './arena/arena.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { ArenaCanvasComponent } from './arena-canvas/arena-canvas.component';
import { PipeModule } from '../shared/pipes/pipe.module';
import { ChallengeComponent } from './challenge/challenge.component';
import { OnlineArenaComponent } from './online-arena/online-arena.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    HomeComponent,
    ArenaComponent,
    ArenaCanvasComponent,
    ChallengeComponent,
    OnlineArenaComponent
  ],
  exports: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    MaterialModule,
    TranslateModule,
    PipeModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PagesModule { }
