import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'filtro',
	standalone: true
})
export class FiltroListaPipe implements PipeTransform {

	transform(array: any[], column: string, buscar: string): Array<any> {

		if (buscar === '') {
			return array;
		}

		buscar = buscar.toLowerCase();

		if (column != '') {
			return array.filter(item => (item[column] + '').toLowerCase().includes(buscar));
		}

		return array.filter(item => (item + '').toLowerCase().includes(buscar));
	}


}
