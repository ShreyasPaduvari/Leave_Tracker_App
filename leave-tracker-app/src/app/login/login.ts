import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  user = {
    username: '',
    password: ''
  };

  readonly USERS_URL = 'http://localhost:3000/users';

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (!this.user.username || !this.user.password) {
      alert('Please enter username and password');
      return;
    }

    // Send GET request to verify user credentials
    const params = new HttpParams()
      .set('username', this.user.username)
      .set('password', this.user.password);

    this.http.get<any[]>(this.USERS_URL, { params })
      .pipe(
        map(users => users || []),
        catchError(err => {
          console.error('Login error', err);
          alert('⚠️ Server error while logging in. Try again later.');
          return of([]);
        })
      )
      .subscribe(users => {
        if (users.length > 0) {
          const loggedInUser = users[0];

          // ✅ Store user info in localStorage for use in dashboard
          localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

          if (loggedInUser.role === 'employee') {
            alert('Welcome Employee!');
            this.router.navigate(['/employee-dashboard']);
          } else if (loggedInUser.role === 'hr') {
            alert('Welcome HR!');
            this.router.navigate(['/hr-dashboard']);
          } else {
            alert('Unknown role!');
          }
        } else {
          alert('Invalid Username or Password');
        }
      });
  }
}
