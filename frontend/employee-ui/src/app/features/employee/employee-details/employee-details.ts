import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EmployeeService, Employee } from '../../../core/employee.service';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css']
})
export class EmployeeDetailsComponent implements OnInit {
  employee: Employee | undefined;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    // Extracts the route configuration param ':id'
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.employeeService.getEmployeeById(id).subscribe({
        next: (data) => {
          this.employee = data;
        },
        error: (err) => {
          console.error('Error fetching employee details from backend:', err);
        }
      });
    }
  }
}