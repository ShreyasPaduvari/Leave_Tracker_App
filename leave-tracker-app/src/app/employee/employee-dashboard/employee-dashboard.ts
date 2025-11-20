import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { interval } from 'rxjs'; // 👈 for auto-refresh
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css']
})
export class EmployeeDashboard implements OnInit {
  user: any;
  leaveHistory: any[] = [];

  private readonly USERS_URL = 'http://localhost:3000/users';
  private readonly LEAVES_URL = 'http://localhost:3001/leave_requests';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('loggedInUser');

    if (storedUser) {
      this.user = JSON.parse(storedUser);
      this.loadUserData(); // initial load

      // 🔁 Auto-refresh every 5 seconds to reflect HR updates
      interval(5000).pipe(switchMap(() => this.http.get<any[]>(this.LEAVES_URL)))
        .subscribe((leaves) => {
          this.leaveHistory = leaves.filter((req) => req.userId === this.user.id);
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
}
