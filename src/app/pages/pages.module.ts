import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ArenaComponent } from './arena/arena.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { ArenaCanvasComponent } from './arena-canvas/arena-canvas.component';
import { PipeModule } from '../shared/pipes/pipe.module';



@NgModule({
  declarations: [
    HomeComponent,
    ArenaComponent,
    ArenaCanvasComponent
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
  ]
})
export class PagesModule { }
