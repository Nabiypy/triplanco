import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocklistPage } from './blocklist.page';

describe('BlocklistPage', () => {
  let component: BlocklistPage;
  let fixture: ComponentFixture<BlocklistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocklistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocklistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
