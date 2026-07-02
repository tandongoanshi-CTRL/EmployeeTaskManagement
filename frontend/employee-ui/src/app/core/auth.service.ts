import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // 🎯 DYNAMIC PORT DETECTION
  private getBaseUrl(): string {
  const hostname = window.location.hostname; // Detects 'localhost' or '127.0.0.1'
  
  // 🎯 SMART AUTO-DETECTION
  // If we are working locally, it dynamically checks what's active or defaults cleanly
  const backendPort = (window.location.port === '4200') ? '8001' : '8000'; 
  
  return `http://${hostname}:${backendPort}/api`;
}

  constructor(private http: HttpClient) {}

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.getBaseUrl()}/login/`, loginData);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}