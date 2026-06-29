import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../../../core/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  errorMessage = '';
  isSubmitting = false;
  existingUsername = '';
  
  backendErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!idParam;
    if (idParam) {
      this.employeeId = +idParam;
    }

    this.initForm();

    if (this.isEditMode && this.employeeId) {
      this.loadEmployeeData(this.employeeId);
    }
  }

  private initForm(): void {
    // === MODIFIED: Explicitly tracking username inside reactive form states to allow clean editing data patches ===
    this.employeeForm = this.fb.group({
      username: [''], 
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['employee', [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(8)]] // Synced min-length (8) with RegisterSerializer checks
    });
    // ===========================================================================================================
  }

  private loadEmployeeData(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.existingUsername = data.username;
        this.employeeForm.patchValue({
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          role: data.role
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to load employee details.';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.backendErrors = {};
    
    const formValue = this.employeeForm.value;
    
    // === MODIFIED: Added safety validation logic to confirm generated username satisfies backend length rules ===
    let generatedUsername = this.isEditMode ? this.existingUsername : formValue.email.split('@')[0];
    if (generatedUsername.length < 3) {
      generatedUsername = generatedUsername + '123'; // Padding fallbacks to satisfy Django min_length=3 validator rules
    }

    const submissionPayload: any = {
      username: generatedUsername,
      first_name: formValue.first_name,
      last_name: formValue.last_name,
      email: formValue.email,
      role: formValue.role
    };
    // =========================================================================================================

    if (!this.isEditMode) {
      submissionPayload.password = formValue.password;
    }

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, submissionPayload).subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (err) => this.handleError(err)
      });
    } else {
      this.employeeService.createEmployee(submissionPayload).subscribe({
        next: () => this.router.navigate(['/employees']),
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isSubmitting = false;
    
    if (err.status === 400 && typeof err.error === 'object') {
      this.backendErrors = {};
      for (const key in err.error) {
        if (err.error.hasOwnProperty(key)) {
          this.backendErrors[key] = Array.isArray(err.error[key]) ? err.error[key][0] : err.error[key];
        }
      }
      this.errorMessage = 'Please fix the highlighted errors below.';
    } else {
      this.errorMessage = err.error?.detail || 'An unexpected error occurred while saving.';
    }
    console.error(err);
  }
}