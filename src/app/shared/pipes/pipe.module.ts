import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeMessagePipe } from './type-message.pipe';



@NgModule({
  declarations: [TypeMessagePipe],
  imports: [
    CommonModule
  ],
  exports: [TypeMessagePipe]
})
export class PipeModule { }
