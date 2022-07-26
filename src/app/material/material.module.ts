import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    MatFormFieldModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule
],
  exports: [
    MatFormFieldModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule
],
})
export class MaterialModule {}
