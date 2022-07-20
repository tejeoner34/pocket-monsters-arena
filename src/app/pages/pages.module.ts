import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ArenaComponent } from './arena/arena.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { TypeMessagePipe } from '../shared/pipes/type-message.pipe';
import { ArenaCanvasComponent } from './arena-canvas/arena-canvas.component';



@NgModule({
  declarations: [
    HomeComponent,
    ArenaComponent,
    TypeMessagePipe,
    ArenaCanvasComponent
  ],
  exports: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    MaterialModule,
    TranslateModule
  ]
})
export class PagesModule { }
