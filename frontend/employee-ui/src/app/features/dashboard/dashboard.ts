import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentRole: string = 'Employee';
  isAdmin: boolean = false; // ADDED: Shared authorization flag for dashboard view wrappers

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.verifyAccessSession();
  }

  verifyAccessSession(): void {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    const isSuperuser = localStorage.getItem('is_superuser') === 'true'; // ADDED

    // Block non-authenticated traffic redirects
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (role) {
      this.currentRole = role;
      
      // ADDED: Evaluates to true if user is an admin, manager, or an explicit superuser
      this.isAdmin = role === 'admin' || role === 'manager' || isSuperuser;
    }
  }

  handleLogout(): void {
    // Purge session variables completely
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_superuser');

    this.router.navigate(['/login']);
  }
}