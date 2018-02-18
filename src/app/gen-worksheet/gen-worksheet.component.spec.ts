import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenWorksheetComponent } from './gen-worksheet.component';

describe('GenWorksheetComponent', () => {
  let component: GenWorksheetComponent;
  let fixture: ComponentFixture<GenWorksheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenWorksheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenWorksheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
