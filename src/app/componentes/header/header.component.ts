import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	standalone: false,
})
export class HeaderComponent implements OnInit {

	@Input('titulo') titulo: string | undefined;

	constructor(
		private menuController: MenuController,
		private storage: StorageService
	) { }

	ngOnInit() { }

	toggleMenu() {
		this.menuController.open();
	}

	cerrarSesion() {
		this.storage.limpiarTodo(true);
	}

}
