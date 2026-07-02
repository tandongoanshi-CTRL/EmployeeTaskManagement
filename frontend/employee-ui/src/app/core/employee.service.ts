import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Employee {
  id?: number; 
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'employee' | 'admin';
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  
  // 🎯 DYNAMIC PORT DETECTION: Detects your current active domain name/IP
  private getBaseUrl(): string {
    const hostname = window.location.hostname; // e.g., 'localhost' or '127.0.0.1'
    const backendPort = '8001';                // 👈 Change this ONLY once here if your port shifts
    
    return `http://${hostname}:${backendPort}/api/employees`;
  }

  constructor(private http: HttpClient) {}

  // Helper method to generate the JWT authorization header dynamically
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
    return { headers };
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.getBaseUrl()}/`, this.getAuthHeaders());
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.getBaseUrl()}/${id}/`, this.getAuthHeaders());
  }

  createEmployee(employeeData: any): Observable<any> {
    return this.http.post(`${this.getBaseUrl()}/`, employeeData, this.getAuthHeaders());
  }

  updateEmployee(id: number, employeeData: any): Observable<any> {
    return this.http.put(`${this.getBaseUrl()}/${id}/`, employeeData, this.getAuthHeaders());
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.getBaseUrl()}/${id}/`, this.getAuthHeaders());
  }
}