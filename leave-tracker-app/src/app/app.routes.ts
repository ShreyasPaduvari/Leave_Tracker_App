import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { EmployeeDashboard } from './employee/employee-dashboard/employee-dashboard';
import { ApplyLeave } from './employee/apply-leave/apply-leave';
import { HrDashboard } from './hr/hr-dashboard/hr-dashboard';
import { HrLeaveRequests } from './hr/leave-requests/leave-requests';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'employee-dashboard', component: EmployeeDashboard },
  { path: 'apply-leave', component: ApplyLeave },
  { path: 'hr-dashboard', component: HrDashboard },
  { path: 'hr-leave-requests', component: HrLeaveRequests }
];
