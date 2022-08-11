import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RivalDisconnectComponent } from './rival-disconnect.component';

describe('RivalDisconnectComponent', () => {
  let component: RivalDisconnectComponent;
  let fixture: ComponentFixture<RivalDisconnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RivalDisconnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RivalDisconnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
