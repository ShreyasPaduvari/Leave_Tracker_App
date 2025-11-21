import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms'; // <--- IMPORTANT: This import is crucial for ngModel

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // <--- IMPORTANT: Add FormsModule here
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css']
})
export class EmployeeDashboard implements OnInit {
  user: any;
  leaveHistory: any[] = []; // All fetched leave history for the user
  paginatedLeaveHistory: any[] = []; // Leave history for the current page

  // Pagination properties <--- IMPORTANT: These were missing or incomplete
  currentPage: number = 1;
  entriesPerPage: number | 'all' = 5; // Default to 5 entries per page
  totalItems: number = 0;
  totalPages: number = 0;

  private readonly USERS_URL = 'http://localhost:3000/users';
  private readonly LEAVES_URL = 'http://localhost:3001/leave_requests';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('loggedInUser');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.loadUserData(); // initial load

      // 🔁 Auto-refresh every 5 seconds to reflect HR updates
      interval(5000).pipe(
        switchMap(() => this.http.get<any[]>(this.LEAVES_URL))
      ).subscribe((leaves) => {
        this.leaveHistory = leaves.filter((req) => req.userId === this.user.id);
        this.updatePagination(); // Update pagination when new data arrives
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ✅ Load user + their leave data from backend
  private loadUserData() {
    this.http.get<any[]>(this.USERS_URL).subscribe({
      next: (users) => {
        const matchedUser = users.find((u) => u.id === this.user.id);
        if (matchedUser) this.user = matchedUser;

        this.http.get<any[]>(this.LEAVES_URL).subscribe({
          next: (leaves) => {
            this.leaveHistory = leaves.filter(
              (req) => req.userId === this.user.id
            );
            this.totalItems = this.leaveHistory.length; // Set total items
            this.updatePagination(); // Initial pagination update after data is loaded
            console.log('✅ Leave history loaded:', this.leaveHistory);
          },
          error: (err) => {
            console.error('❌ Error loading leave requests:', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Error loading users:', err);
      }
    });
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

  // --- Pagination Methods <--- IMPORTANT: These methods were missing or incomplete
  updatePagination() {
    this.totalItems = this.leaveHistory.length;
    
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

    this.paginatedLeaveHistory = this.leaveHistory.slice(startIndex, endIndex);
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