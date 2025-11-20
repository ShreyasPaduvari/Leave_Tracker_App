import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveRequests } from './leave-requests';

describe('LeaveRequests', () => {
  let component: LeaveRequests;
  let fixture: ComponentFixture<LeaveRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaveRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
