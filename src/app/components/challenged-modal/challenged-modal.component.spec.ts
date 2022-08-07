import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengedModalComponent } from './challenged-modal.component';

describe('ChallengedModalComponent', () => {
  let component: ChallengedModalComponent;
  let fixture: ComponentFixture<ChallengedModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengedModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengedModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
