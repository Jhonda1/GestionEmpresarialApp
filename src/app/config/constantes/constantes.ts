export class Constantes {
	static valoresTemas = [{
		titulo: 'Oscuro', valor: 'dark'
	}, {
		titulo: 'Estandar', valor: 'estandar'
	}];

	static temas = [{
		name: 'dark',
		styles: [
			{ themeVariable: '--ion-color-primary', value: '#737373' },
			{ themeVariable: '--ion-color-primary-rgb', value: '34,34,34' },
			{ themeVariable: '--ion-color-primary-contrast', value: '#ffffff' },
			{ themeVariable: '--ion-color-primary-contrast-rgb', value: '255,255,255' },
			{ themeVariable: '--ion-color-primary-shade', value: '#1e2023' },
			{ themeVariable: '--ion-color-primary-tint', value: '#383a3e' },
			{ themeVariable: '--ion-item-ios-background-color', value: '#717171' },
			{ themeVariable: '--ion-item-md-background-color', value: '#717171' },
			{ themeVariable: '--ion-tabbar-background-color', value: '#222428' },
			{ themeVariable: '--ion-tabbar-ios-text-color-active', value: '#ffffff' },
			{ themeVariable: '--ion-tabbar-md-text-color-active', value: '#ffffff' },
			{ themeVariable: '--ion-background-color', value: '#171616' },
			{ themeVariable: '--ion-background-color-rgb', value: '23, 22, 22' },
			{ themeVariable: '--ion-color-gray', value: '#2a2a2a' },
			{ themeVariable: '--ion-color-light', value: '#1f1c1c' },
			{ themeVariable: '--ion-color-medium', value: '#e0e1e6' },
			{ themeVariable: '--ion-color-dark', value: '#ffffff' },
			{ themeVariable: '--ion-color-light-contrast', value: '#f9efef' },
			{ themeVariable: '--ion-backdrop-color', value: '#fff' },
			{ themeVariable: '--ion-text-color', value: '#fff' },
			{ themeVariable: '--ion-border-color', value: '#92949c' },
			{ themeVariable: '--text-toolbar', value: '#a9a9a9' },
			{ themeVariable: '--toolbar-menu', value: '#1e2023' }
		]
	}, {
		name: 'estandar',
		styles: [
			{ themeVariable: '--ion-color-primary', value: '#3880ff' },
			{ themeVariable: '--ion-color-primary-rgb', value: '56, 128, 255' },
			{ themeVariable: '--ion-color-primary-contrast', value: '#ffffff' },
			{ themeVariable: '--ion-color-primary-contrast-rgb', value: '255, 255, 255' },
			{ themeVariable: '--ion-color-primary-shade', value: '#3171e0' },
			{ themeVariable: '--ion-color-primary-tint', value: '#4c8dff' },
			{ themeVariable: '--ion-item-ios-background-color', value: '#ffffff' },
			{ themeVariable: '--ion-item-md-background-color', value: '#ffffff' },
			{ themeVariable: '--ion-tabbar-background-color', value: '#222428' },
			{ themeVariable: '--ion-tabbar-ios-text-color-active', value: '#999999' },
			{ themeVariable: '--ion-tabbar-md-text-color-active', value: '#999999' },
			{ themeVariable: '--ion-background-color', value: '#ffffff' },
			{ themeVariable: '--ion-background-color-rgb', value: '255, 255, 255' },
			{ themeVariable: '--ion-color-gray', value: '#f4f5f8' },
			{ themeVariable: '--ion-color-light', value: '#ffffff' },
			{ themeVariable: '--ion-color-medium', value: '#92949c' },
			{ themeVariable: '--ion-color-dark', value: '#222428' },
			{ themeVariable: '--ion-color-light-contrast', value: '#000' },
			{ themeVariable: '--ion-backdrop-color', value: '#000' },
			{ themeVariable: '--ion-text-color', value: '#000' },
			{ themeVariable: '--ion-border-color', value: '#c8c7cc' },
			{ themeVariable: '--text-toolbar', value: '#ffffff' },
			{ themeVariable: '--toolbar-menu', value: '#f1f1f1' }
		]
	}];

	static generos = [{
		valor: 'M', titulo: 'Masculino'
	}, {
		valor: 'F', titulo: 'Femenino'
	}];

	static tipoCalculo = [
		{valor: 'D', titulo: 'Dias'},
		{valor: 'H', titulo: 'Horas'}
	];

	static escalaAusentismo = [
		{valor: 'D', titulo: 'Leve'},
		{valor: 'H', titulo: 'Moderado'},
		{valor: 'H', titulo: 'Severo'},
		{valor: 'H', titulo: 'Grave'},
		{valor: 'H', titulo: 'Mortal'},
	];

	// eslint-disable-next-line @typescript-eslint/naming-convention
	static grupo_sanguineo = [
		{ valor: 'O-', titulo: 'O-' },
		{ valor: 'O+', titulo: 'O+' },
		{ valor: 'A-', titulo: 'A-' },
		{ valor: 'A+', titulo: 'A+' },
		{ valor: 'B-', titulo: 'B-' },
		{ valor: 'B+', titulo: 'B+' },
		{ valor: 'AB-', titulo: 'AB-' }
	];

	static ppal = [{
		valor: 0, titulo: 'No'
	}, {
		valor: 1, titulo: 'Si'
	}];

}
