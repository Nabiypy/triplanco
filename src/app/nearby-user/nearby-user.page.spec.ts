import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyUserPage } from './nearby-user.page';

describe('NearbyUserPage', () => {
  let component: NearbyUserPage;
  let fixture: ComponentFixture<NearbyUserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearbyUserPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
