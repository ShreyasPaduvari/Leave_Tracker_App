import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './apply-leave.html',
  styleUrls: ['./apply-leave.css']
})
export class ApplyLeave {
  user: any;
  leave = {
    type: '',
    start: '',
    end: ''
  };

  private readonly LEAVES_URL = 'http://localhost:3001/leave_requests';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // ✅ Function called when user submits leave form
  submitLeave() {
    if (!this.leave.type || !this.leave.start || !this.leave.end) {
      alert('Please fill in all leave details');
      return;
    }

    const newLeave = {
      userId: this.user.id,
      type: this.leave.type,
      start: this.leave.start,
      end: this.leave.end,
      status: 'Pending'
    };

    // ✅ Add leave request to JSON Server (POST)
    this.http.post(this.LEAVES_URL, newLeave).subscribe({
      next: () => {
        alert('Leave request submitted successfully!');
        this.router.navigate(['/employee-dashboard']); // go back to dashboard
      },
      error: (err) => {
        console.error('❌ Error submitting leave request:', err);
        alert('Error submitting leave request. Please try again.');
      }
    });
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    this.router.navigate(['/login']);
  }
}
