import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeMessagePipe } from './type-message.pipe';
import { LongStringPipe } from './long-string.pipe';



@NgModule({
  declarations: [TypeMessagePipe, LongStringPipe],
  imports: [
    CommonModule
  ],
  exports: [TypeMessagePipe, LongStringPipe]
})
export class PipeModule { }
