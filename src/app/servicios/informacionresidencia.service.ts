import { Injectable } from '@angular/core';
import { maxLength, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionResidencia extends PeticionService {

	private _paisid!: string;
	private _dptoid!: string;
	private _ciudadid!: string;
	private _principal!: string;
	private _direccion!: string;

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public set paisid(value: string) {
		this._paisid = value;
	}
	public get paisid(): string {
		return this._paisid;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public set dptoid(value: string) {
		this._dptoid = value;
	}
	public get dptoid(): string {
		return this._dptoid;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public set ciudadid(value: string) {
		this._ciudadid = value;
	}
	public get ciudadid(): string {
		return this._ciudadid;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 120, message: 'Maximo 30 caracteres' })
	public set direccion(value: string) {
		this._direccion = value;
	}
	public get direccion(): string {
		return this._direccion;
	}

	@required({ message: 'Campo requerido.' })
	public get principal(): string {
		return this._principal;
	}
	public set principal(value: string) {
		this._principal = value;
	}

}

