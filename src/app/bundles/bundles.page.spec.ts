import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BundlesPage } from './bundles.page';

describe('BundlesPage', () => {
  let component: BundlesPage;
  let fixture: ComponentFixture<BundlesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BundlesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BundlesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
