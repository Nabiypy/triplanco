import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyMapPage } from './nearby-map.page';

describe('NearbyMapPage', () => {
  let component: NearbyMapPage;
  let fixture: ComponentFixture<NearbyMapPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NearbyMapPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NearbyMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
