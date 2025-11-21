import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './hr-dashboard.html',
  styleUrls: ['./hr-dashboard.css']
})
export class HrDashboard implements OnInit {
  employees: any[] = []; // All fetched employees
  paginatedEmployees: any[] = []; // Employees for the current page

  // Pagination properties
  currentPage: number = 1;
  entriesPerPage: number | 'all' = 5; // Can be a number or 'all', default to 5 for less clutter initially
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadEmployees();
  }

  private loadEmployees() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(data => {
      this.employees = data.filter(user => user.role === 'employee');
      this.totalItems = this.employees.length;
      this.updatePagination(); // Initial pagination update
    });
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }

  // --- Pagination Methods ---
  updatePagination() {
    this.totalItems = this.employees.length;
    
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

    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
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