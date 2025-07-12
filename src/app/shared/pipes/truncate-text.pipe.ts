import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {
  transform(
    value: string,
    maxLength: number = 50,
    suffix: string = '...'
  ): string {
    if (!value || value.length <= maxLength) {
      return value;
    }

    return value.substring(0, maxLength - suffix.length) + suffix;
  }
}
