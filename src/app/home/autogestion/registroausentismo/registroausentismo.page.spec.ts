import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroausentismoPage } from './registroausentismo.page';

describe('RegistroausentismoPage', () => {
  let component: RegistroausentismoPage;
  let fixture: ComponentFixture<RegistroausentismoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroausentismoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
