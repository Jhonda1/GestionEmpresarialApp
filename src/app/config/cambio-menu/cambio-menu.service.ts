import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  	providedIn: 'root'
})
export class CambioMenuService {

  	subject$ = new Subject();
  	fotoActualizada$ = new Subject<string>();

 	constructor() { }

  	cambio(value: unknown) {
		this.subject$.next(value);
	}

	/* Suscripcion para cuando se cambie el menú */
	suscripcion(): Observable<any> {
		return this.subject$;
	}

	/* Notificar que la foto se actualizó */
	notificarCambioFoto(nuevaFotoUrl: string) {
		console.log('🔔 Notificando cambio de foto:', nuevaFotoUrl.substring(0, 50));
		this.fotoActualizada$.next(nuevaFotoUrl);
	}

	/* Suscripción para cambios de foto */
	suscripcionCambioFoto(): Observable<string> {
		return this.fotoActualizada$;
	}
}
