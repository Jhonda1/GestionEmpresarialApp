/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { email, maxLength, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class DatosEmpleadosService extends PeticionService {

	private _nombre: string | undefined;
	private _tipoTerceroId: string | undefined;
	private _documento: string | undefined;
	private _empleadoId: string | undefined;
	private _cargo: string | undefined;
	private _sueldo: string | undefined;
	private _codigo: string | undefined;
	private _id: string | undefined;

	constructor() {
		super();
	}



  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get tipoTerceroId(): string {
		return this._tipoTerceroId ?? '';
	}
	public set tipoTerceroId(value: string) {
		this._tipoTerceroId = value;
	}

  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get documento(): string {
		return this._documento ?? '';
	}
	public set documento(value: string) {
		this._documento = value;
	}

  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get empleadoId(): string {
		return this._empleadoId ?? '';
	}
	public set empleadoId(value: string) {
		this._empleadoId = value;
	}

  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get cargo(): string {
		return this._cargo ?? '';
	}
	public set cargo(value: string) {
		this._cargo = value;
	}

  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get sueldo(): string {
		return this._sueldo ?? '';
	}
	public set sueldo(value: string) {
		this._sueldo = value;
	}
  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get codigo(): string {
		return this._codigo ?? '';
	}
	public set codigo(value: string) {
		this._codigo = value;
	}
  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get id(): string {
		return this._id ?? '';
	}
	public set id(value: string) {
		this._id = value;
	}
	@maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get nombre(): string {
		return this._nombre ?? '';
	}
	public set nombre(value: string) {
		this._nombre = value;
	}
}

