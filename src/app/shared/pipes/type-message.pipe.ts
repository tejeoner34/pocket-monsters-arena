import { Pipe, PipeTransform } from '@angular/core';
import { wait } from '../helpers';

@Pipe({
  name: 'typeMessage'
})
export class TypeMessagePipe implements PipeTransform {

  transform(value: string): string {
    let finalMessage = '';
    if(value.length){
      (async () => {
        let visibleMessage = '';
        for(let i = 0; i < value.length; i++){
          await wait(25);
          console.log(visibleMessage)
          visibleMessage = visibleMessage + value[i];
          finalMessage = visibleMessage;
        }

      } )();
    }
    return finalMessage;
  }

}
