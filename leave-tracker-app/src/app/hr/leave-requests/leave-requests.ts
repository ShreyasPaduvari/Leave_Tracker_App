import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-hr-leave-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leave-requests.html',
  styleUrls: ['./leave-requests.css']
})
export class HrLeaveRequests implements OnInit {
  leaveRequests: any[] = [];
  private readonly LEAVES_URL = 'http://localhost:3001/leave_requests';
  private readonly USERS_URL = 'http://localhost:3000/users';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadLeaveRequests();
  }

  private loadLeaveRequests() {
    this.http.get<any[]>(this.LEAVES_URL).subscribe(data => {
      this.leaveRequests = data.map(req => ({
        ...req,
        balanceAdjusted: req.balanceAdjusted ?? false // ensure flag exists
      }));
    });
  }

  updateStatus(requestId: number, newStatus: string) {
    const url = `${this.LEAVES_URL}/${requestId}`;
    const leave = this.leaveRequests.find(req => req.id === requestId);
    if (!leave) return;

    // 🚫 Prevent duplicate same-status updates
    if (leave.status === newStatus) {
      alert(`This leave is already marked as ${newStatus}.`);
      return;
    }

    const previousStatus = leave.status;

    this.http.patch(url, { status: newStatus }).subscribe(() => {
      leave.status = newStatus; // update locally too

      // ✅ Manage balance safely using flag
      if (newStatus === 'Approved' && !leave.balanceAdjusted) {
        this.updateLeaveBalance(leave.userId, leave.start, leave.end, 'deduct');
        leave.balanceAdjusted = true;
        this.http.patch(url, { balanceAdjusted: true }).subscribe(); // persist flag
      } 
      else if (newStatus === 'Rejected' && leave.balanceAdjusted) {
        this.updateLeaveBalance(leave.userId, leave.start, leave.end, 'restore');
        leave.balanceAdjusted = false;
        this.http.patch(url, { balanceAdjusted: false }).subscribe(); // persist flag
      } 
      else {
        console.log('No balance adjustment needed.');
      }
    });
  }

  private updateLeaveBalance(userId: number, start: string, end: string, action: 'deduct' | 'restore') {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    this.http.get<any[]>(this.USERS_URL).subscribe(users => {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      let updatedBalance = user.leaveBalance;

      if (action === 'deduct') {
        updatedBalance = Math.max(0, user.leaveBalance - days);
        alert(`📉 ${days} day(s) deducted from ${user.username}'s leave balance.`);
      } else if (action === 'restore') {
        updatedBalance = user.leaveBalance + days;
        alert(`📈 ${days} day(s) restored to ${user.username}'s balance.`);
      }

      this.http.patch(`${this.USERS_URL}/${userId}`, { leaveBalance: updatedBalance })
        .subscribe(() => console.log(`✅ Balance updated for ${user.username}`));
    });
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }
}
