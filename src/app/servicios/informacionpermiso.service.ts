import { Injectable } from '@angular/core';
import { email, maxLength, maxNumber, numeric, NumericValueType, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionPermiso extends PeticionService {

	private _Dias: number = 0;
	private _horas: number = 0;
	private _FechaInicio: string = '';
	private _FechaFin: string = '';
	private _TipoAusentismoId: string = '';
	private _TipoCalculo: string = '';
	private _Observacion: string = '';
	private _horas_dia_laboradas: number = 0;
	private _total_horas: number = 0;

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })
	public get TipoAusentismoId(): string {
		return this._TipoAusentismoId;
	}
	public set TipoAusentismoId(value: string) {
		this._TipoAusentismoId = value;
	}
	@required({ message: 'Campo requerido.' })
	public get TipoCalculo(): string {
		return this._TipoCalculo;
	}
	public set TipoCalculo(value: string) {
		this._TipoCalculo = value;
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get FechaInicio(): string {
		return this._FechaInicio;
	}
	public set FechaInicio(value: string) {
		this._FechaInicio = value;
	}

	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get Observacion(): string {
		return this._Observacion;
	}
	public set Observacion(value: string) {
		this._Observacion = value;
	}
	@maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	public get horas_dia_laboradas(): number {
		return this._horas_dia_laboradas;
	}
	public set horas_dia_laboradas(value: number) {
		this._horas_dia_laboradas = value;
	}
	@maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	public get total_horas(): number {
		return this._total_horas;
	}
	public set total_horas(value: number) {
		this._total_horas = value;
	}

  @required({ message: 'Campo requerido.' })
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get FechaFin(): string {
		return this._FechaFin;
	}
	public set FechaFin(value: string) {
		this._FechaFin = value;
	}

	// @required({ message: 'Campo requerido.' })
	@maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo nùmeros positivos' })
	@maxNumber({ value: 250, message: 'Solo nùmeros hasta 250' })
	public get Dias(): number {
		return this._Dias;
	}
	public set Dias(value: number) {
		this._Dias = value;
	}

  @maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo nùmeros positivos' })
	@maxNumber({ value: 250, message: 'Solo nùmeros hasta 250' })
	public get horas(): number {
		return this._horas;
	}
	public set horas(value: number) {
		this._horas = value;
	}

}

