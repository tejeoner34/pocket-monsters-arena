import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'longString'
})
export class LongStringPipe implements PipeTransform {

  transform(value: string): string {
    let finalString = value;
    const length = value.length;
    if(length > 10) {
      finalString = finalString.slice(0, 10) + '...';
    }
    return finalString;
  }

}
