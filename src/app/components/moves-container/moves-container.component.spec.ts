import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovesContainerComponent } from './moves-container.component';

describe('MovesContainerComponent', () => {
  let component: MovesContainerComponent;
  let fixture: ComponentFixture<MovesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MovesContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MovesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
