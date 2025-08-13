import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { StorageService } from 'src/app/servicios/storage.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	standalone: true,
	imports: [
		CommonModule,
		IonicModule
	]
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
