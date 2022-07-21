import { gsap } from 'gsap';
export class PokemonClass {
  img: any;
  name: string;
  position: any;
  originalPosition: any;
  isOpponent: boolean;
  opacity: number;

  constructor(
    position: any,
    img: any,
    name: string,
    isOpponent = false,
    opacity: number = 1
  ) {
    this.img = img;
    this.name = name;
    this.position = position;
    this.originalPosition = position;
    this.isOpponent = isOpponent;
    this.opacity = opacity;
  }

  draw(ctx: any) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.drawImage(this.img, this.position.x, this.position.y, 200, 200);
    ctx.restore();
  }

  attack(recepient: any) {
    const timeLine = gsap.timeline();

    if (this.isOpponent) {
      timeLine
        .to(this.position, {
          x: this.position.x + 20,
        })
        .to(this.position, {
          x: this.position.x - 40,
          duration: 0.1,
          onComplete() {
            console.log(recepient);
            gsap.to(recepient.position, {
              x: recepient.position.x - 20,
              yoyo: true,
              repeat: 1,
              duration: 0.05,
            });
            gsap.to(recepient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.1,
            });
          },
        })
        .to(this.position, {
          x: this.position.x,
        });
    } else {
      timeLine
        .to(this.position, {
          x: this.position.x - 20,
        })
        .to(this.position, {
          x: this.position.x + 40,
          duration: 0.1,
          onComplete() {
            console.log(recepient);
            gsap.to(recepient.position, {
              x: recepient.position.x + 20,
              yoyo: true,
              repeat: 1,
              duration: 0.05,
            });
            gsap.to(recepient, {
              opacity: 0,
              yoyo: true,
              repeat: 3,
              duration: 0.1,
            });
          },
        })
        .to(this.position, {
          x: this.position.x,
        });
    }
  }

  receiveAttack() {}
}

export class LifeContainer {
  name: string;
  life: number;
  ctx: any;
  position: any;
  currentLife: number;

  constructor(name: string, life: number, ctx: any, position: any) {
    this.name = name;
    this.life = life;
    this.ctx = ctx;
    this.position = position;
    this.currentLife = life;
  }

  draw() {
    const lifebarWidth = this.currentLife === 1 ? 270 : this.currentLife*270; 
    this.ctx.beginPath();
    this.ctx.fillStyle = '#f5f6da';
    this.ctx.fillRect(this.position.x, this.position.y, 350, 100);
    // this.ctx.rect();
    this.ctx.stroke();
    this.ctx.font = '20px Pokemon-GB';
    this.ctx.fillStyle = '#646161';
    this.ctx.fillText(
      this.name,
      this.position.x + 20,
      this.position.y + 30
    ); 
    this.ctx.beginPath();
    this.ctx.lineWidth = '3';
    this.ctx.strokeStyle = '#646161';
    this.ctx.rect(this.position.x, this.position.y, 350, 100);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#646161';
    this.ctx.fillRect(this.position.x + 20, this.position.y + 50, 300, 20);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(this.position.x + 50, this.position.y + 52, lifebarWidth, 16);
    this.ctx.stroke();
    this.ctx.font = '12px Pokemon-GB';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(
      'HP',
      this.position.x + 23,
      this.position.y + 65
    ); 
  }

  updateName(name: string) {
    this.name = name;
  }

  updateLife(lifePercentage: number) {
    this.currentLife = this.currentLife * lifePercentage;
  }
}
