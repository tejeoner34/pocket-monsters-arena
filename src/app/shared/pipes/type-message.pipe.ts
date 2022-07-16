import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { wait } from '../helpers';

@Pipe({
  name: 'typeMessage'
})
export class TypeMessagePipe implements PipeTransform {
  

  transform(value: string): Observable<string> {

    return new Observable(obs => {
      if(value.length) {
        (async () => {
          let message = '';
          for(let i = 0; i < value.length; i ++) {
            await wait(25);
            message = message + value[i];
            obs.next(message);
          }
        })();
      }
    });
  }

}
