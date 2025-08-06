import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitarvacacionesPage } from './solicitarvacaciones.page';

describe('SolicitarvacacionesPage', () => {
  let component: SolicitarvacacionesPage;
  let fixture: ComponentFixture<SolicitarvacacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarvacacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
