import { Injectable } from '@angular/core';
import { compare, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class ForgetPasswordService extends PeticionService {

	private _num_docu: string | undefined;
	private _password: string | undefined;
	private _confirmPassword: string | undefined;

	constructor() {
		super();
	}


	@required({ message: 'Ingreso n° documento.' })
	public get num_docu(): string {
		return this._num_docu ?? '';
	}
	public set num_docu(value: string) {
		this._num_docu = value;
	}

	@required({ message: 'Ingrese la contraseña.' })
	@compare({ fieldName: 'confirmPassword', message: 'Las contraseñas no coinciden' })
	public get password(): string {
		return this._password ?? '';
	}
	public set password(value: string) {
		this._password = value;
	}

	@required({ message: 'Ingrese la contraseña.' })
	@compare({ fieldName: 'password', message: 'Las contraseñas no coinciden' })
	public get confirmPassword(): string {
		return this._confirmPassword ?? '';
	}
	public set confirmPassword(value: string) {
		this._confirmPassword = value;
	}
}
