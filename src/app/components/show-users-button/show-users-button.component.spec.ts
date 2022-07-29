import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowUsersButtonComponent } from './show-users-button.component';

describe('ShowUsersButtonComponent', () => {
  let component: ShowUsersButtonComponent;
  let fixture: ComponentFixture<ShowUsersButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowUsersButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowUsersButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
