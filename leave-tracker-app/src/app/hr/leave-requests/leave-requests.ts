import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-hr-leave-requests',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './leave-requests.html',
  styleUrls: ['./leave-requests.css']
})
export class HrLeaveRequests implements OnInit {
  leaveRequests: any[] = []; // All fetched leave requests
  paginatedLeaveRequests: any[] = []; // Requests for the current page
  
  // Pagination properties
  currentPage: number = 1;
  entriesPerPage: number | 'all' = 5; // Can be a number or 'all'
  totalItems: number = 0;
  totalPages: number = 0;

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
      this.totalItems = this.leaveRequests.length;
      this.updatePagination(); // Initial pagination update
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

    // const previousStatus = leave.status; // Not used, can be removed

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
      this.updatePagination(); // Re-render table and pagination after status update
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

  // --- Pagination Methods ---
  updatePagination() {
    this.totalItems = this.leaveRequests.length;
    
    this.totalPages = this.entriesPerPage === 'all'
      ? 1
      : Math.ceil(this.totalItems / (this.entriesPerPage as number));

    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.currentPage === 0 && this.totalPages > 0) {
      this.currentPage = 1;
    } else if (this.totalPages === 0) {
      this.currentPage = 0; // No pages if no items
    }

    const startIndex = (this.currentPage - 1) * (this.entriesPerPage === 'all' ? 0 : this.entriesPerPage as number);
    const endIndex = this.entriesPerPage === 'all'
      ? this.totalItems
      : startIndex + (this.entriesPerPage as number);

    this.paginatedLeaveRequests = this.leaveRequests.slice(startIndex, endIndex);
  }

  goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.updatePagination();
    }
  }

  onEntriesPerPageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value;
    this.entriesPerPage = selectedValue === 'all' ? 'all' : parseInt(selectedValue, 10);
    this.currentPage = 1; // Reset to first page when entries per page changes
    this.updatePagination();
  }

  // Helper getter to determine which page numbers to display in the pagination controls
  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5; // As in your example JS

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

      // Adjust startPage if endPage is too close to totalPages
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }
}