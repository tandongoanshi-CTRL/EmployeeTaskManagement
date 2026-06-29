import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // Model binding for user registration credentials matching Django requirements
  user = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee' // Automatically defaults to employee
  };

  errorMessage = '';
  successMessage = '';

  private registerUrl = 'http://localhost:8000/api/auth/register/';

  constructor(private http: HttpClient, private router: Router) {}

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<any>(this.registerUrl, this.user).subscribe({
      next: (response) => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        // Delay redirection slightly so the user can see the success notification banner
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        // Handle custom backend regex validation errors gracefully
        if (error.error && typeof error.error === 'object') {
          // Extracts Django REST framework error messages cleanly
          const firstKey = Object.keys(error.error)[0];
          this.errorMessage = `${firstKey}: ${error.error[firstKey][0]}`;
        } else {
          this.errorMessage = 'Registration failed. Please check your network connection or details.';
        }
      }
    });
  }
}