// CORRECT
import { Component } from '@angular/core'; // Component comes from @angular/core
import { CommonModule } from '@angular/common'; // CommonModule stays here
import { RouterOutlet } from '@angular/router';
// FIX 1: Corrected the relative path to go into features/employee
import { EmployeeListComponent } from './features/employee/employee-list/employee'; 
import { LoginComponent } from './auth/login/login'; 
import { RegisterComponent } from './auth/register/register'; // ADDED: Imported RegisterComponent for pipeline resolution

@Component({
  selector: 'app-root',
  standalone: true,
  // FIX 2: Added RouterOutlet and CommonModule alongside your list component
  // MODIFIED: Included both LoginComponent and RegisterComponent inside imports to handle standalone routing
  imports: [CommonModule, RouterOutlet, EmployeeListComponent, LoginComponent, RegisterComponent], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
// FIX 3: Added the "export" keyword so main.ts can find AppComponent
export class AppComponent {
  title = 'employee-ui';
}