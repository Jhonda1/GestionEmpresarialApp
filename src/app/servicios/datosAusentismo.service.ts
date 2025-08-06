import { Injectable } from '@angular/core';
import { email, maxLength, prop, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';
import { DecimalPipe } from '@angular/common';

@Injectable({
	providedIn: 'root'
})
export class DatosAusentismosService extends PeticionService {

	private _areaId: number;
	private _tipoAusentismoId: number;
	private _grado: string;
	private _fechainicio: Date;
	private _fechaFin: Date;
	private _cie10: string;
	private _tipoCalculo: string;
	private _horas_dias_laboradas: number;
	private _dias: number;
	private _horas: DecimalPipe;
	private _total_horas: DecimalPipe;
	private _costo_hora: string;
	private _costo_total: string;
	private _observacion: string;


	constructor() {
		super();
		this._areaId = 0;
		this._tipoAusentismoId = 0;
		this._grado = '';
		this._fechainicio = new Date();
		this._fechaFin = new Date();
		this._cie10 = '';
		this._tipoCalculo = '';
		this._horas_dias_laboradas = 0;
		this._dias = 0;
		this._horas = new DecimalPipe('en-US');
		this._total_horas = new DecimalPipe('en-US');
		this._costo_hora = '';
		this._costo_total = '';
		this._observacion = '';
	}
	@required({ message: 'Campo requerido.' })
    @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get areaId(): number {
		return this._areaId;
	}
	public set areaId(value: number) {
		this._areaId = value;
	}
    @required({ message: 'Campo requerido.' })
    @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get tipoAusentismoId(): number {
		return this._tipoAusentismoId;
	}
	public set tipoAusentismoId(value: number) {
		this._tipoAusentismoId = value;
	}
    @maxLength({ value: 20, message: 'Maximo 20 caracteres' })
	public get grado(): string {
		return this._grado;
	}
	public set grado(value: string) {
		this._grado = value;
	}
    @required({ message: 'Campo requerido.' })
    @maxLength({ value: 10, message: 'Maximo 10 caracteres' })
	public get fechainicio(): Date {
		return this._fechainicio;
	}
	public set fechainicio(value: Date) {
		this._fechainicio = value;
	}
    @required({ message: 'Campo requerido.' })
    @maxLength({ value: 10, message: 'Maximo 10 caracteres' })
	public get fechaFin(): Date {
		return this._fechaFin;
	}
	public set fechaFin(value: Date) {
		this._fechaFin = value;
	}
  @maxLength({ value: 100, message: 'Maximo 100 caracteres' })
	public get cie10(): string {
		return this._cie10;
	}
	public set cie10(value: string) {
		this._cie10 = value;
	}
    @required({ message: 'Campo requerido.' })
    @maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	public get tipoCalculo(): string {
		return this._tipoCalculo;
	}
	public set tipoCalculo(value: string) {
		this._tipoCalculo = value;
	}
  @maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	public get horas_dias_laboradas(): number {
		return this._horas_dias_laboradas;
	}
	public set horas_dias_laboradas(value: number) {
		this._horas_dias_laboradas = value;
	}
  @maxLength({ value: 3, message: 'Maximo 3 caracteres' })
	public get dias(): number {
		return this._dias;
	}
	public set dias(value: number) {
		this._dias = value;
	}
  @maxLength({ value: 11, message: 'Maximo 11 caracteres' })
	public get horas(): DecimalPipe {
		return this._horas;
	}
	public set horas(value: DecimalPipe) {
		this._horas = value;
	}
  @maxLength({ value: 11, message: 'Maximo 11 caracteres' })
	public get total_horas(): DecimalPipe {
		return this._total_horas;
	}
	public set total_horas(value: DecimalPipe) {
		this._total_horas = value;
	}
  @maxLength({ value: 20, message: 'Maximo 20 caracteres' })
	public get costo_hora(): string {
		return this._costo_hora;
	}
	public set costo_hora(value: string) {
		this._costo_hora = value;
	}
  @maxLength({ value: 20, message: 'Maximo 20 caracteres' })
	public get costo_total(): string {
		return this._costo_total;
	}
	public set costo_total(value: string) {
		this._costo_total = value;
	}
  @maxLength({ value: 1000, message: 'Maximo 1000 caracteres' })
	public get observacion(): string {
		return this._observacion;
	}
	public set observacion(value: string) {
		this._observacion = value;
	}
}

