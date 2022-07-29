import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PointsService {

  userPoints: number = 0;

  constructor() { }

  updateUserPoints(pointsToAdd: number) {
    this.userPoints = this.userPoints + pointsToAdd;
  }

  getUserPoints() {
    return this.userPoints;
  }
}
