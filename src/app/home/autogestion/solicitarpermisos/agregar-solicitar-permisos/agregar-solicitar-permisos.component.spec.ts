import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AgregarSolicitarPermisosComponent } from './agregar-solicitar-permisos.component';

describe('AgregarSolicitarPermisosComponent', () => {
  let component: AgregarSolicitarPermisosComponent;
  let fixture: ComponentFixture<AgregarSolicitarPermisosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarSolicitarPermisosComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarSolicitarPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
