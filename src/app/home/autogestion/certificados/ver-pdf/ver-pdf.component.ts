import { Component, inject, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ver-pdf',
  templateUrl: './ver-pdf.component.html',
  styleUrls: ['./ver-pdf.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PdfViewerModule,
    FontAwesomeModule
  ]
})
export class VerPdfComponent implements OnInit {

	@Input() url: any;
	valorZoom: number = 1;
	safeUrl: SafeResourceUrl | string = '';
	isBase64: boolean = false;
	totalPages: number = 0;
	currentPage: number = 1;

	constructor(private modalController: ModalController, private sanitizer: DomSanitizer) { }

	ngOnInit() {
		this.processUrl();
	}

	processUrl() {
		if (!this.url) {
			console.error('No se recibió URL');
			return;
		}

		// Verificar si es una URL HTTP/HTTPS
		if (this.url.startsWith('http://') || this.url.startsWith('https://')) {
			this.isBase64 = false;
			this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
		} 
		// Verificar si ya es un data URI base64
		else if (this.url.startsWith('data:application/pdf;base64,')) {
			this.isBase64 = true;
			this.safeUrl = this.url;
		}
		// Si es solo el string base64 sin el prefijo
		else {
			this.isBase64 = true;
			this.safeUrl = `data:application/pdf;base64,${this.url}`;
		}
	}

	cerrarModal(datos?: any) {
		this.modalController.dismiss(datos);
	}

	/**
	 * Detecta cuando el PDF se carga y obtiene información
	 * para evitar mostrar páginas en blanco
	 */
	onDocumentLoad(event: any) {
		try {
			if (event && event.pagesCount) {
				this.totalPages = event.pagesCount;
				console.log(`PDF cargado con ${this.totalPages} páginas`);
			}
		} catch (error) {
			console.error('Error al obtener información del PDF:', error);
		}
	}

}
