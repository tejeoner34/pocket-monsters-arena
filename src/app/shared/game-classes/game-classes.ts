import { gsap } from 'gsap';
export class PokemonClass {
  img: any;
  name: string;
  position: any;
  originalPosition: any;
  isOpponent: boolean;
  opacity: number;

  constructor(position: any, img: any, name: string, isOpponent = false, opacity: number = 1) {
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
                duration: 0.1
            })
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
                duration: 0.1
            })
          },
        })
        .to(this.position, {
          x: this.position.x,
        });
    }
  }

  receiveAttack() {}
}
