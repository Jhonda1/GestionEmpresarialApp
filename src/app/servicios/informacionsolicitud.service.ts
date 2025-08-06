import { Injectable } from '@angular/core';
import { email, maxLength, maxNumber, numeric, NumericValueType, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionSolicitud extends PeticionService {

	private _DiaCompensado: number = 0;
	private _FechaInicio: string = '';

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get FechaInicio(): string {
		return this._FechaInicio;
	}
	public set FechaInicio(value: string) {
		this._FechaInicio = value;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo nùmeros positivos' })
	@maxNumber({ value: 250, message: 'Solo nùmeros hasta 250' })
	public get DiaCompensado(): number {
		return this._DiaCompensado;
	}
	public set DiaCompensado(value: number) {
		this._DiaCompensado = value;
	}

}

