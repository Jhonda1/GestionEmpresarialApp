import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatosbasicosPage } from './datosbasicos.page';

describe('DatosbasicosPage', () => {
  let component: DatosbasicosPage;
  let fixture: ComponentFixture<DatosbasicosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosbasicosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
