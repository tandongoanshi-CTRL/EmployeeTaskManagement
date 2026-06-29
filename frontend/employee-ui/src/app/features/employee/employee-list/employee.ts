import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { EmployeeService } from '../../../core/employee.service';

export interface Employee {
  id?: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './employee.html',
  styleUrls: ['./employee.css']
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = []; 
  errorMessage = '';
  isAdmin: boolean = false; // ADDED: Authorization tracking flag for list layouts

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.checkUserRole(); // ADDED: Run session verification before data extraction
    this.loadEmployees();
  }

  // ADDED: Determines visibility rules for modifiers using local session descriptors
  private checkUserRole(): void {
    const role = localStorage.getItem('user_role');
    const superuserStatus = localStorage.getItem('is_superuser');
    this.isAdmin = role === 'admin' || role === 'manager' || superuserStatus === 'true';
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data: any[]) => {
        this.employees = data;
        console.log('UI View updated with data array:', data);
      },
      error: (err) => {
        this.errorMessage = 'Failed to stream data down to list view';
        console.error(err);
      }
    });
  }

  deleteEmployee(id: number | undefined): void {
    // Safety check block to prevent standard profiles bypassing the UI layer
    if (!this.isAdmin) {
      this.errorMessage = 'Action Rejected: Regular staff profiles cannot execute deletions.';
      return;
    }

    if (id && confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          console.log('Employee deleted successfully from database context.');
          this.loadEmployees(); 
        },
        error: (err) => {
          this.errorMessage = 'Failed to execute structural deletion on server.';
          console.error(err);
        }
      });
    }
  }
}