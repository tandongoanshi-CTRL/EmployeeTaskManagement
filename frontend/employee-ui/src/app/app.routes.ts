import { Routes } from '@angular/router';
import { EmployeeListComponent } from './features/employee/employee-list/employee';
import { EmployeeDetailsComponent } from './features/employee/employee-details/employee-details';
import { EmployeeFormComponent } from './features/employee/employee-form/employee-form.component';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard'; // Fixed path

export const routes: Routes = [
  // Authentication Routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // App Dashboard Shell Container
  {
    path: '',
    component: DashboardComponent,
    children: [
      { 
        path: 'tasks', 
        loadComponent: () => import('./features/task/task-list/task').then(m => m.TaskComponent) 
      },
      {
        path: 'employees',
        children: [
          { path: '', component: EmployeeListComponent },            
          { path: 'new', component: EmployeeFormComponent },          
          { path: 'edit/:id', component: EmployeeFormComponent },     
          { path: ':id', component: EmployeeDetailsComponent },        
        ]
      },
      { path: '', redirectTo: 'tasks', pathMatch: 'full' }
    ]
  },
  
  // Default fallback route
  { path: '**', redirectTo: 'login' }
];