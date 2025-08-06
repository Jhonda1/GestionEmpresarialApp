import { Injectable } from '@angular/core';
import { email, maxLength, numeric, NumericValueType, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionAcademica extends PeticionService {

	private _niveleducativo_id: string = '';
	private _institucion: string = '';
	private _ultimocursado: string = '';
	private _fecha_finalizacion: string = '';
	private _titulo: string = '';


	constructor() {
		super();
	}

	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo valores númericos' })
	@maxLength({ value: 200, message: 'Maximo 30 caracteres' })
	public set ultimocursado(value: string) {
		this._ultimocursado = value;
	}
	public get ultimocursado(): string {
		return this._ultimocursado;
	}

	@required({ message: 'Campo requerido.' })
	public set niveleducativo_id(value: string) {
		this._niveleducativo_id = value;
	}
	public get niveleducativo_id(): string {
		return this._niveleducativo_id;
	}

	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public set fecha_finalizacion(value: string) {
		this._fecha_finalizacion = value;
	}
	public get fecha_finalizacion(): string {
		return this._fecha_finalizacion;
	}

	@maxLength({ value: 200, message: 'Maximo 30 caracteres' })
	public set institucion(value: string) {
		this._institucion = value;
	}
	public get institucion(): string {
		return this._institucion;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 200, message: 'Maximo 30 caracteres' })
	public set titulo(value: string) {
		this._titulo = value;
	}
	public get titulo(): string {
		return this._titulo;
	}

}

