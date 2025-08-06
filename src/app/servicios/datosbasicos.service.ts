/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { email, maxLength, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class DatosbasicosService extends PeticionService {

  private _nombre: string = '';
	private _nombruno: string = '';
	private _nombrdos: string = '';
	private _apelluno: string = '';
	private _apelldos: string = '';
	private _fecha_nac: string = '';
	private _sexo: string = '';
  private _grupo_sanguineo: string = '';
	private _estadocivil_id: string = '';

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })

  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get nombre(): string {
		return this._nombre;
	}
	public set nombre(value: string) {
		this._nombre = value;
	}

	@maxLength({ value: 300, message: 'Maximo 300 caracteres' })
	public get nombruno(): string {
		return this._nombruno;
	}
	public set nombruno(value: string) {
		this._nombruno = value;
	}

	@maxLength({ value: 300, message: 'Maximo 300 caracteres' })
	public get nombrdos(): string {
		return this._nombrdos;
	}
	public set nombrdos(value: string) {
		this._nombrdos = value;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 300, message: 'Maximo 300 caracteres' })
	public get apelluno(): string {
		return this._apelluno;
	}
	public set apelluno(value: string) {
		this._apelluno = value;
	}

	@maxLength({ value: 300, message: 'Maximo 300 caracteres' })
	public get apelldos(): string {
		return this._apelldos;
	}
	public set apelldos(value: string) {
		this._apelldos = value;
	}

	@prop()
	public get sexo(): string {
		return this._sexo;
	}
	public set sexo(value: string) {
		this._sexo = value;
	}

  @maxLength({ value: 5, message: 'Maximo 5 caracteres' })
  @prop()
	public get grupo_sanguineo(): string {
		return this._grupo_sanguineo;
	}
	public set grupo_sanguineo(value: string) {
		this._grupo_sanguineo = value;
	}

	@prop()
	public get fecha_nac(): string {
		return this._fecha_nac;
	}
	public set fecha_nac(value: string) {
		this._fecha_nac = value;
	}

	@prop()
	public get estadocivil_id(): string {
		return this._estadocivil_id;
	}
	public set estadocivil_id(value: string) {
		this._estadocivil_id = value;
	}
}

