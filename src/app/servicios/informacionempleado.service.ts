import { Injectable } from '@angular/core';
import { maxLength, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class  InformacionEmpleado extends PeticionService {

    private _paisid: string = '';
    private _dptoid: string = '';
    private _ciudadid: string = '';
	private _pasatiempo: string = '';

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })

    @maxLength({ value: 120, message: 'Maximo 120 caracteres' })
	public get pasatiempo(): string {
		return this._pasatiempo;
	}
	public set pasatiempo(value: string) {
		this._pasatiempo = value;
	}

	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get paisid(): string {
		return this._paisid;
	}
	public set paisid(value: string) {
		this._paisid = value;
	}

	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get dptoid(): string {
		return this._dptoid;
	}
	public set dptoid(value: string) {
		this._dptoid = value;
	}

    @maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get ciudadid(): string {
		return this._ciudadid;
	}
	public set ciudadid(value: string) {
		this._ciudadid = value;
	}

}

