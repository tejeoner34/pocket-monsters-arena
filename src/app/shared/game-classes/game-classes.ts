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

  defeat() {
    gsap.to(this.position, {
      y: this.position.y + 20
    });
    gsap.to(this, {
      opacity: 0
    })
  }
}

export class LifeContainer {
  name: string;
  ctx: any;
  position: any;
  currentLifePercentage: number;
  totalLife: number;
  currentLife: number;
  isOpponent: boolean;
  lifeBarWidth: number = 0;

  constructor(
    name: string,
    currentLifePercentage: number,
    currentLife: number,
    totalLife: number,
    ctx: any,
    position: any,
    isOpponent = false
  ) {
    this.name = name;
    this.currentLifePercentage = currentLifePercentage;
    this.currentLife = currentLife;
    this.totalLife = totalLife;
    this.ctx = ctx;
    this.position = position;
    this.isOpponent = isOpponent;
  }

  draw() {
    this.lifeBarWidth =
      this.currentLifePercentage === 1 ? 270 : this.currentLifePercentage * 270;
    this.ctx.beginPath();
    this.ctx.fillStyle = '#f5f6da';
    this.ctx.fillRect(this.position.x, this.position.y, 350, 100);
    // this.ctx.rect();
    this.ctx.stroke();
    this.ctx.font = '20px Pokemon-GB';
    this.ctx.fillStyle = '#646161';
    this.ctx.fillText(this.name, this.position.x + 20, this.position.y + 30);
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
    if(this.currentLifePercentage < 0.4) {
      this.ctx.fillStyle = 'orange';
    } else if(this.currentLifePercentage < 0.2) {
      this.ctx.fillStyle = 'red';
    } else {
      this.ctx.fillStyle = '#77dea9';
    }
    this.ctx.fillRect(
      this.position.x + 50,
      this.position.y + 52,
      this.lifeBarWidth,
      16
    );
    this.ctx.stroke();
    this.ctx.font = '12px Pokemon-GB';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('HP', this.position.x + 23, this.position.y + 65);

    if (!this.isOpponent) {
      this.ctx.font = '12px Pokemon-GB';
      this.ctx.fillStyle = '#646161';
      this.ctx.fillText(
        `${this.currentLife} / ${this.totalLife}`,
        this.position.x + 50,
        this.position.y + 85
      );
    }
  }

  updateName(name: string) {
    this.name = name;
  }

  updateLife(lifePercentage: number) {
    this.currentLife = Math.floor(this.currentLife * lifePercentage);
    this.currentLifePercentage = lifePercentage;
  }
}

// export class InfoContainer {
//     message: string;
//   constructor(message: string) {
//     this.message = message;
//   }

//   draw(ctx: any) {
//     console.log('dsafdsfsdf')
//     ctx.beginPath();
//     ctx.fillStyle = '#f5f6da';
//     ctx.fillRect(0, 350, 350, 100);
//     ctx.stroke();
//     ctx.font = '12px Pokemon-GB';
//     ctx.fillStyle = '#ffffff';
//     ctx.fillText(this.message , this.position.x + 23, this.position.y + 65);
    
//   }
// }
