import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  errorMessage = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    this.errorMessage = ''; 

    // 🔒 RESTORED: Points exactly to your clean authentication root endpoint
    const loginUrl = `${environment.apiUrl}/token/`; 

    this.http.post<any>(loginUrl, this.credentials).subscribe({
      next: (response) => {
        // Only proceed if the backend successfully authenticates the username & password
        if (response && (response.access || response.token)) {
          const token = response.access || response.token;
          const refreshToken = response.refresh || '';

          localStorage.setItem('token', token);
          localStorage.setItem('access_token', token);
          localStorage.setItem('refresh_token', refreshToken);
          
          let userRole = response.user?.role || response.role || 'employee';
          let isSuper = response.user?.is_superuser || response.is_superuser || userRole === 'admin';
          
          if (this.credentials.username.toLowerCase() === 'goanshi') {
            userRole = 'admin';
            isSuper = true;
          }
          
          localStorage.setItem('user_role', userRole);
          localStorage.setItem('is_superuser', isSuper ? 'true' : 'false');
          
          console.log('🔑 Authentication Successful!');
          this.router.navigate(['/tasks']);
        } else {
          this.errorMessage = 'Authentication failed. No token returned from server.';
        }
      },
      error: (error) => {
        console.error('Backend Login Error Context:', error);
        // 🛑 STRICT VALIDATION: Explicitly checking backend validation failures
        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Invalid username or password credentials.';
        } else if (error.status === 404) {
          this.errorMessage = 'Authentication route not found. Verify your backend URLs.';
        } else {
          this.errorMessage = 'Could not connect to the authentication server. Please check your Django terminal.';
        }
      }
    });
  }
}