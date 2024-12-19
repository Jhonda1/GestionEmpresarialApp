import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  	providedIn: 'root'
})
export class CambioMenuService {

  	subject$ = new Subject();

 	constructor() { }

  	cambio(value: unknown) {
		this.subject$.next(value);
	}

	/* Suscripcion para cuando se cambie el menú */
	suscripcion(): Observable<any> {
		return this.subject$;
	}
}
