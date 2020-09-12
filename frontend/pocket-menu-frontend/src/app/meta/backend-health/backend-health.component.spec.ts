import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendHealthComponent } from './backend-health.component';

describe('BackendHealthComponent', () => {
  let component: BackendHealthComponent;
  let fixture: ComponentFixture<BackendHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackendHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackendHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
