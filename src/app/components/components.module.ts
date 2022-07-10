import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeballComponent } from './pokeball/pokeball.component';






@NgModule({
  declarations: [
    PokeballComponent,
  ],
  exports: [
    PokeballComponent,
  ],
  imports: [
    CommonModule,
  ]
})
export class ComponentsModule { }
