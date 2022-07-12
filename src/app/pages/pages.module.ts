import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ComponentsModule } from '../components/components.module';
import { ArenaComponent } from './arena/arena.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { TypeMessagePipe } from '../shared/pipes/type-message.pipe';



@NgModule({
  declarations: [
    HomeComponent,
    ArenaComponent,
    TypeMessagePipe
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
