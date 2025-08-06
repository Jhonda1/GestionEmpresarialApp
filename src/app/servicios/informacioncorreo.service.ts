import { Injectable } from '@angular/core';
import { email, maxLength, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionCorreo extends PeticionService {

	private _correo!: string;
	private _principal!: string;

	constructor() {
		super();
	}

	@prop()
	@required({ message: 'Campo requerido.' })
	public get principal(): string {
		return this._principal;
	}
	public set principal(value: string) {
		this._principal = value;
	}

	@maxLength({ value: 50, message: 'Maximo 50 caracteres' })
	@required({ message: 'Campo requerido.' })
	@email({ message: 'Correo electronico no valido' })
	public set correo(value: string) {
		this._correo = value;
	}
	public get correo(): string {
		return this._correo;
	}

}

