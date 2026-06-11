import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyBob', standalone: true })
export class CurrencyBobPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return 'Bs 0';
    return `Bs ${value.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}
