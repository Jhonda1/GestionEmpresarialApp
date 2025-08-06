import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AgregarSolicitudVacacionesComponent } from './agregar-solicitud-vacaciones.component';

describe('AgregarSolicitudVacacionesComponent', () => {
  let component: AgregarSolicitudVacacionesComponent;
  let fixture: ComponentFixture<AgregarSolicitudVacacionesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarSolicitudVacacionesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarSolicitudVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
