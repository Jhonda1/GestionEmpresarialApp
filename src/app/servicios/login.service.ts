import { Injectable } from '@angular/core';
import { required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class LoginService extends PeticionService {

	private _nit: string | undefined;
	private _num_docu: string | undefined;
	private _password: string | undefined;

	constructor() {
		super();
	}


	@required({ message: 'Ingrese un valor valido.' })
	public get nit(): string {
		return this._nit || '';
	}
	public set nit(value: string) {
		this._nit = value;
	}

	@required({ message: 'Ingreso n° documento.' })
	public get num_docu(): string {
		return this._num_docu || '';
	}
	public set num_docu(value: string) {
		this._num_docu = value;
	}

	@required({ message: 'Ingrese la contraseña.' })
	public get password(): string {
		return this._password || '';
	}
	public set password(value: string) {
		this._password = value;
	}
}
