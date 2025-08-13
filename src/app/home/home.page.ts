import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, timer } from 'rxjs';
import { debounce, distinct } from 'rxjs/operators';
import { ThemeService } from '../servicios/theme.service';
import { MenuComponent } from '../componentes/menu/menu.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    MenuComponent
  ]
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {

  private subject = new Subject();

  constructor(
    private theme: ThemeService
  ) {}
	ngOnInit() {}

  	ngAfterViewInit() { }

	ngOnDestroy() {
		this.subject.next(true);
		this.subject.complete();
	}

  	detectorDom() {
		const observador = new MutationObserver((cambios) => {
			cambios = cambios.filter((elem: any) => (Array.from(elem?.target?.classList) as string[])?.includes('resizable'));
			this.subject.next(cambios);
		});
		const raiz = document.querySelector('#main-cont');
		if (raiz) {
			observador.observe(raiz as Node, { attributes: true, subtree: true, childList: true, });
		}

		this.subject.pipe(
			debounce(() => timer(150)),
			distinct()
		).subscribe(() => this.theme.setFontSize(1));
	}
}
