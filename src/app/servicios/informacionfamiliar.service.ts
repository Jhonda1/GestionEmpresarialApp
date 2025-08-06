import { Injectable } from '@angular/core';
import { maxLength, numeric, NumericValueType, required } from '@rxweb/reactive-form-validators';
import { PeticionService } from '../config/peticiones/peticion.service';

@Injectable({
	providedIn: 'root'
})
export class InformacionFamiliar extends PeticionService {

	private _tipodoc_id: string = '';
	private _num_docu: string = '';
	private _nombre: string = '';
	private _fecha_nac: string = '';
	private _tel_fijo: string = '';
	private _celular: string = '';
	private _direccion: string = '';
	private _tercero_id: string = '';
	private _parentesco_id: string = '';

	constructor() {
		super();
	}

	@required({ message: 'Campo requerido.' })
	@maxLength({ value: 200, message: 'Maximo 200 caracteres' })
	public get nombre(): string {
		return this._nombre;
	}
	public set nombre(value: string) {
		this._nombre = value;
	}

	@required({message: 'Campo requerido'})
	public get tipodoc_id(): string {
		return this._tipodoc_id;
	}
	public set tipodoc_id(value: string) {
		this._tipodoc_id = value;
	}

	@required({message: 'Campo requerido'})
	public get fecha_nac(): string {
		return this._fecha_nac;
	}
	public set fecha_nac(value: string) {
		this._fecha_nac = value;
	}

	@required({message: 'Campo requerido'})
	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get num_docu(): string {
		return this._num_docu;
	}
	public set num_docu(value: string) {
		this._num_docu = value;
	}

	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo valores númericos' })
	@maxLength({ value: 50, message: 'Maximo 50 caracteres' })
	public get tel_fijo(): string {
		return this._tel_fijo;
	}
	public set tel_fijo(value: string) {
		this._tel_fijo = value;
	}

	@numeric({ acceptValue: NumericValueType.PositiveNumber, allowDecimal: false, message: 'Solo valores númericos' })
	@maxLength({ value: 50, message: 'Maximo 50 caracteres' })
	public get celular(): string {
		return this._celular;
	}
	public set celular(value: string) {
		this._celular = value;
	}

	@maxLength({ value: 50, message: 'Maximo 50 caracteres' })
	public get direccion(): string {
		return this._direccion;
	}
	public set direccion(value: string) {
		this._direccion = value;
	}

	@maxLength({ value: 30, message: 'Maximo 30 caracteres' })
	public get tercero_id(): string {
		return this._tercero_id;
	}
	public set tercero_id(value: string) {
		this._tercero_id = value;
	}

	@required({message: 'Campo requerido'})
	public get parentesco_id(): string {
		return this._parentesco_id;
	}
	public set parentesco_id(value: string) {
		this._parentesco_id = value;
	}

}

