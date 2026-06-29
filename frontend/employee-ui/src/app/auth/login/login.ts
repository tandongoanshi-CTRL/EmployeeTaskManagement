import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 

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
  private authUrl = 'http://localhost:8000/api/auth/login/';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin(): void {
    this.errorMessage = ''; 

    this.http.post<any>(this.authUrl, this.credentials).subscribe({
      next: (response) => {
        if (response && response.access) {
          localStorage.setItem('token', response.access);
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          
          let userRole = response.user?.role || response.role || 'employee';
          let isSuper = response.user?.is_superuser || response.is_superuser || userRole === 'admin';
          
          // -------------------------------------------------------------------------
          // ADDED: Direct admin profile injection for your superuser account
          // -------------------------------------------------------------------------
          if (this.credentials.username.toLowerCase() === 'goanshi') {
            userRole = 'admin';
            isSuper = true;
          }
          
          localStorage.setItem('user_role', userRole);
          localStorage.setItem('is_superuser', isSuper ? 'true' : 'false');
          
          this.router.navigate(['/tasks']);
        }
      },
      error: (error) => {
        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Invalid username or password credentials.';
        } else {
          this.errorMessage = 'Could not connect to the authentication server. Please try again later.';
        }
      }
    });
  }
}