/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { RxFormGroup, RxFormBuilder } from '@rxweb/reactive-form-validators';
import  moment from 'moment';
import { environment } from '../../../environments/environment';
import { FormGroup } from '@angular/forms';

export class FuncionesGenerales {

	static ordenar(a: any, column?: string, orden?: number, b?: any): number {
		if (column && b && orden) {
			return a[column] > b[column] ? orden : (a[column] < b[column] ? (orden === -1 ? 1 : -1) : 0);
		} else if (column) {
			return a[column] ? 1 : -1;
		}
		return 0;
	}

	static formatearFecha(fecha: string, formato?: string, iso?: boolean): string {
		const valorFecha = moment(fecha);
		if (iso) {
			return valorFecha.toISOString();
		}
		return valorFecha.format(formato ? formato : 'DD/MM/YYYY');
	}

	static urlGestion() {
		return environment.urlBack;
	}

	static crearFormulario(service: any, group?: boolean) {
		let formulario: RxFormGroup;
		if (group) {
			formulario = <RxFormGroup>new RxFormBuilder().group(service);
		} else {
			formulario = <RxFormGroup>new RxFormBuilder().formGroup(service);
		}
		const propiedades: Array<string> = Object.keys(formulario.controls);
		return { formulario, propiedades };
	}

	static formularioTocado(formulario: FormGroup) {
		Object.keys(formulario.controls).forEach(field => {
		  const control = formulario.get(field);
		  control?.markAsTouched({ onlySelf: true });
		});
	  }

	// eslint-disable-next-line arrow-body-style
	static rastreo = (cambio: any, programa: string) => {
		return { fecha: moment().format('YYYY-DD-M HH:mm:ss'), programa, cambio };
	};

	static generarColorAutomatico() {
		const VALORESCOLORES = '0123456789ABCDEF';
		let color = '#';
		for (let index = 0; index < VALORESCOLORES.length - 10; index++) {
			color += VALORESCOLORES[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	static permisos(tipo = '') {
		const datos = [
			{ id: 600100, tipo: 'menu' }, // Permiso base para mostrar el menú
			// Datos Personales
			{ id: 6001006, tipo: 'Datos Personales' },
			{ id: 60010061, tipo: 'DP', campo: 'nombruno' },
			{ id: 60010062, tipo: 'DP', campo: 'nombrdos' },
			{ id: 60010063, tipo: 'DP', campo: 'apelluno' },
			{ id: 60010064, tipo: 'DP', campo: 'apelldos' },
			{ id: 60010065, tipo: 'DP', campo: 'estadocivil_id' },
			{ id: 60010066, tipo: 'DP', campo: 'sexo' },
			{ id: 60010067, tipo: 'DP', campo: 'grupo_sanguineo' },
			{ id: 60010068, tipo: 'DP', campo: 'fecha_nac' },

			//{ id: 6001001, tipo: 'Información Empleado' },
			{ id: 60010011, tipo: 'IE', campo: 'paisid' },
			{ id: 60010012, tipo: 'IE', campo: 'dptoid' },
			{ id: 60010013, tipo: 'IE', campo: 'ciudadid' },
			//{ id: 60010014, tipo: 'IE', campo: 'clave' },
			{ id: 60010015, tipo: 'IE', campo: 'pasatiempo' },

			//{ id: 6001002, tipo: 'Información Familiar' },
			{ id: 60010021, tipo: 'FI', campo: 'tipodoc_id' },
			{ id: 60010022, tipo: 'FI', campo: 'num_docu' },
			{ id: 60010023, tipo: 'FI', campo: 'parentesco_id' },
			{ id: 60010024, tipo: 'FI', campo: 'nombre' },
			{ id: 60010025, tipo: 'FI', campo: 'fecha_nac' },
			{ id: 60010026, tipo: 'FI', campo: 'tel_fijo' },
			{ id: 60010027, tipo: 'FI', campo: 'celular' },
			{ id: 60010028, tipo: 'FI', campo: 'direccion' },

			//{ id: 6001003, tipo: 'Información Academica' },
			{ id: 60010031, tipo: 'IC', campo: 'niveleducativo_id' },
			{ id: 60010032, tipo: 'IC', campo: 'institucion' },
			{ id: 60010033, tipo: 'IC', campo: 'ultimocursado' },
			{ id: 60010034, tipo: 'IC', campo: 'fecha_finalizacion' },
			{ id: 60010035, tipo: 'IC', campo: 'titulo' },

			{ id: 60010046, tipo: 'DC', campo: 'fijo' },
			{ id: 60010047, tipo: 'DC', campo: 'celular' },
			{ id: 60010048, tipo: 'DC', campo: 'principal' },

			//{ id: 6001004, tipo: 'Datos de Contacto' },
			{ id: 60010041, tipo: 'DR', campo: 'paisid' },
			{ id: 60010042, tipo: 'DR', campo: 'dptoid' },
			{ id: 60010043, tipo: 'DR', campo: 'ciudadid' },
			{ id: 60010044, tipo: 'DR', campo: 'principal' },
			{ id: 60010045, tipo: 'DR', campo: 'direccion' },

			{ id: 60010049, tipo: 'CC', campo: 'correo' },
			{ id: 60010050, tipo: 'CC', campo: 'principal' },
			{ id: 6001005, 	tipo: 'RP', campo: 'Reportes' },
			{ id: 6001007, 	tipo: 'CL', campo: 'Certificados Laborales' },
			{ id: 60010071, tipo: 'CL', campo: 'Carta Laboral' },
			{ id: 60010072, tipo: 'CL', campo: 'Extratos' },
			{ id: 60010073, tipo: 'CL', campo: 'Certificados' },
			{ id: 6001008, 	tipo: 'SV', campo: 'Solicitar Vacaciones' },
			{ id: 60010081, tipo: 'SV', campo: 'Periodos vacacionales pendientes' },
			{ id: 60010082, tipo: 'SV', campo: 'Periodos vacacionales disfrutados o pagados' },
			{ id: 60010083, tipo: 'SV', campo: 'Crear' },
			{ id: 6001009, 	tipo: 'RC', campo: 'Ausentismo' },
			// Gastos
			{ id: 500100, tipo: 'GASTOS', campo: 'modulo_gastos' },

		];

		if (tipo === '') {
			return datos.map(op => op.id);
		} else {
			return datos.filter(op => op.tipo === tipo);
		}
	}

	/**
	 * Valida si un usuario tiene un permiso específico
	 * @param permisoId - ID del permiso a validar
	 * @param segurArray - Array de permisos del usuario (SEGUR)
	 * @returns boolean - true si tiene el permiso, false en caso contrario
	 */
	static validarPermiso(permisoId: number, segurArray: number[]): boolean {
		if (!permisoId || !segurArray || segurArray.length === 0) {
			return false;
		}
		return segurArray.includes(permisoId);
	}

	/**
	 * Obtiene la información de un permiso específico
	 * @param permisoId - ID del permiso
	 * @returns Objeto con información del permiso o null si no existe
	 */
	static obtenerInfoPermiso(permisoId: number) {
		const permisos = FuncionesGenerales.permisos('');
		const permisosCompletos = [
			{ id: 600100, tipo: 'menu', descripcion: 'Acceso al menú principal' },
			{ id: 6001006, tipo: 'Datos Personales', descripcion: 'Ver y editar datos personales' },
			{ id: 6001007, tipo: 'CL', descripcion: 'Certificados Laborales' },
			{ id: 6001008, tipo: 'SV', descripcion: 'Solicitar Vacaciones' },
			{ id: 6001009, tipo: 'RC', descripcion: 'Registro de Ausentismo' },
			{ id: 500100, tipo: 'GASTOS', descripcion: 'Módulo de Gastos' },
		];
		
		return permisosCompletos.find(p => p.id === permisoId) || null;
	}

	/**
	 * Verifica permisos y retorna el estado del acceso
	 * @param permisoId - ID del permiso a verificar
	 * @param segurArray - Array de permisos del usuario (SEGUR)
	 * @param nombreModulo - Nombre del módulo para el mensaje
	 * @returns Objeto con el estado del permiso y mensaje
	 */
	static verificarPermisoConMensaje(permisoId: number, segurArray: number[], nombreModulo: string = 'este módulo') {
		const tienePermiso = FuncionesGenerales.validarPermiso(permisoId, segurArray);
		
		return {
			tienePermiso,
			mensaje: tienePermiso 
				? '' 
				: `No tiene permisos para acceder a ${nombreModulo}. Contacte al administrador del sistema.`,
			codigoPermiso: permisoId,
			infoPermiso: FuncionesGenerales.obtenerInfoPermiso(permisoId)
		};
	}

	/**
	 * Genera un mensaje HTML para mostrar cuando no se tienen permisos
	 * @param nombreModulo - Nombre del módulo
	 * @param permisoId - ID del permiso requerido
	 * @returns String con HTML del mensaje de sin permisos
	 */
	static generarMensajeSinPermisos(nombreModulo: string, permisoId?: number): string {
		const permisoTexto = permisoId ? ` (Permiso requerido: ${permisoId})` : '';
		
		return `
			<div style="text-align: center; padding: 40px 20px; color: #666;">
				<ion-icon name="lock-closed-outline" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></ion-icon>
				<h2 style="color: #333; margin-bottom: 10px;">Acceso Restringido</h2>
				<p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
					No tiene permisos para acceder a <strong>${nombreModulo}</strong>.
				</p>
				<p style="font-size: 14px; color: #999;">
					Contacte al administrador del sistema para solicitar acceso.${permisoTexto}
				</p>
			</div>
		`;
	}

}
