import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string, type: 'first' | 'all' | 'title' = 'first'): string {
    if (!value) {
      return value;
    }

    switch (type) {
      case 'first':
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

      case 'all':
        return value.toUpperCase();

      case 'title':
        return value.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );

      default:
        return value;
    }
  }
}
