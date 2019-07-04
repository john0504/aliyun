import { Pipe, PipeTransform } from '@angular/core';

const OUTLIER_REPLACEMENT: string = '__value__';

@Pipe({
  name: 'replace',
})
export class ValueReplacerPipe implements PipeTransform {

  transform(text: string, value) {
    if (!value && value !== 0) {
      return '--';
    }
    if (text) {
      return text.replace(OUTLIER_REPLACEMENT, value);
    }
  }
}
