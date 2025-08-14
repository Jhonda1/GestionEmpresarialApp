import { Injector, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CustomInjectorService } from './config/peticiones/peticion.service';
import { PermisosInterceptor } from './interceptors/permisos.interceptor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { IonicSelectableComponent } from 'ionic-selectable';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
@NgModule({
	declarations: [
		AppComponent // Declaramos AppComponent como componente tradicional
	],
	imports: [
		BrowserModule
		, IonicModule.forRoot()
		, AppRoutingModule
		, HttpClientModule
		, ReactiveFormsModule
		, FormsModule
    	, IonicSelectableComponent
    	, FontAwesomeModule
		, IonicStorageModule.forRoot({
			driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
			name: '__GestionEmpresarialDB',
			storeName: 'settings',
			description: 'GestionEmpresarialApp temp data'
		}),
	],
	providers: [
		{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: PermisosInterceptor,
			multi: true
		}
	],
	bootstrap: [AppComponent],
})
export class AppModule {
	constructor(private injector: Injector,library: FaIconLibrary) {
    library.addIconPacks(fas, fab, far);
		if (!CustomInjectorService.injector) {
			CustomInjectorService.injector = this.injector;
		}
	}
}
