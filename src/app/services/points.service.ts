import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PointsService {

  damage: number = 0;
  _user: any;

  constructor(
    private userService: UserService
  ) {
    userService.user$.subscribe(res => {
      this._user = res;
    });
   }

  updateDamagePoints(pointsToAdd: number) {
    this.damage = pointsToAdd;
    if(this._user) {
      this._user.points = this._user.points + this.damage;
      this.userService.updateUserData(this._user);
    }
  }

  getDamage() {
    return this.damage;
  }
}
