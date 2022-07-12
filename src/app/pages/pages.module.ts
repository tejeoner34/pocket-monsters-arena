import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { ComponentsModule } from '../components/components.module';
import { MaterialModule } from '../material.module';
import { ArenaComponent } from './arena/arena.component';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    HomeComponent,
    ArenaComponent
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
