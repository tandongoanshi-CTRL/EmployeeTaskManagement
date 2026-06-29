import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // MODIFIED: Imported HttpHeaders to send token
import { Observable } from 'rxjs';

// === MODIFIED: Made id, first_name, and last_name optional (?) for creation safety, and aligned roles with Django ===
export interface Employee {
  id?: number; 
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'employee' | 'admin';
  password?: string; // Added to support your backend registration validation requirements safely
}
// ==============================================================================================================

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8000/api/employees'; 

  constructor(private http: HttpClient) {}

  // ADDED: Helper method to generate the JWT authorization header dynamically
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}) // Injects Bearer token if present
    });
    return { headers };
  }

  getEmployees(): Observable<Employee[]> {
    // MODIFIED: Added authorization headers to allow listing employees safely
    return this.http.get<Employee[]>(`${this.apiUrl}/`, this.getAuthHeaders());
  }

  getEmployeeById(id: number): Observable<Employee> {
    // MODIFIED: Added authorization headers
    return this.http.get<Employee>(`${this.apiUrl}/${id}/`, this.getAuthHeaders());
  }

  createEmployee(employeeData: any): Observable<any> {
    // MODIFIED: Added authorization headers
    return this.http.post(`${this.apiUrl}/`, employeeData, this.getAuthHeaders());
  }

  updateEmployee(id: number, employeeData: any): Observable<any> {
    // MODIFIED: Added authorization headers
    return this.http.put(`${this.apiUrl}/${id}/`, employeeData, this.getAuthHeaders());
  }

  // === ADDED: Missing delete handler to tie into your EmployeeListComponent actions ===
  deleteEmployee(id: number): Observable<any> {
    // MODIFIED: Added authorization headers
    return this.http.delete(`${this.apiUrl}/${id}/`, this.getAuthHeaders());
  }
  // ==================================================================================
}