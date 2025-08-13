import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'camelCase',
  standalone: true
})
export class CamelCasePipe implements PipeTransform {

  transform(palabra: string): string {
		if (!palabra) {
			return '';
		}
		palabra = palabra.replace(/[^a-zA-Z ]/g, '');
		let conversion: string = '';
		Array.from(palabra).forEach(char => {
			if (char === ' ') {
				conversion += ' ';
			} else if (char === char.toUpperCase()) {
				conversion += ' ' + char.toLowerCase();
			} else {
				conversion += char.toLowerCase();
			}
		});
		return conversion;
	}

}
