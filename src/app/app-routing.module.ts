import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArenaCanvasComponent } from './pages/arena-canvas/arena-canvas.component';
import { ArenaComponent } from './pages/arena/arena.component';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent, pathMatch: 'full'},
  {path: 'arena', component: ArenaComponent, pathMatch: 'full'},
  {path: 'arena-canvas', component: ArenaCanvasComponent, pathMatch: 'full'},
  { path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
