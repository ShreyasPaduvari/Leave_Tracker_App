import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const payload = { ...this.signupForm.value, role: 'employee', leaveBalance: 20 };

      this.userService.signup(payload).subscribe({
        next: () => {
          alert('✅ Signup successful!');
          this.router.navigate(['/login']);
        },
        error: err => {
          console.error('Signup failed', err);
          alert('⚠️ Signup failed. Please try again.');
        }
      });
    } else {
      alert('⚠️ Enter valid username and password');
    }
  }
}
