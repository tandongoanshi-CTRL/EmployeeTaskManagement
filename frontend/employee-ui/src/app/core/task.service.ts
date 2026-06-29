import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================================
// NEW INTERFACES FOR TASK SUB-MODULE DETAILS
// =====================================================================
export interface Comment {
  id?: number;
  task: number;
  author?: number;
  author_username?: string;
  content: string;
  created_at?: string;
}

export interface TaskAttachment {
  id?: number;
  task: number;
  uploaded_by?: number;
  uploaded_by_username?: string;
  file: string; // URL string returned from backend media endpoints
  file_name: string;
  uploaded_at?: string;
}

export interface AuditLog {
  id: number;
  task?: number;
  action_by_username: string;
  action_type: string;
  description: string;
  timestamp: string;
}

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to: number;
  assigned_to_username?: string;
  created_by?: number;
  created_by_username?: string;
  comments?: Comment[];
  attachments?: TaskAttachment[];
  audit_logs?: AuditLog[];
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseApiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Standardized authorization header manager
  private getAuthHeaders(isMultipart = false): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    let headersConfig: any = {};
    
    // If uploading files, do NOT manually supply a content-type boundary string
    if (!isMultipart) {
      headersConfig['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }
    
    return { headers: new HttpHeaders(headersConfig) };
  }

  // =====================================================================
  // CORE TASK ENDPOINTS (WITH INTEGRATED SEARCH AND FILTER HANDLING)
  // =====================================================================
  getTasks(filters?: { status?: string; assigned_to?: string; search?: string }): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.assigned_to) params = params.set('assigned_to', filters.assigned_to);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<Task[]>(`${this.baseApiUrl}/tasks/`, {
      headers: this.getAuthHeaders().headers,
      params: params
    });
  }

  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseApiUrl}/tasks/${id}/`, this.getAuthHeaders());
  }

  createTask(taskData: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.baseApiUrl}/tasks/`, taskData, this.getAuthHeaders());
  }

  updateTask(id: number, taskData: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.baseApiUrl}/tasks/${id}/`, taskData, this.getAuthHeaders());
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.baseApiUrl}/tasks/${id}/`, this.getAuthHeaders());
  }

  // =====================================================================
  // COMMENT MODULE SUB-ENDPOINTS
  // =====================================================================
  addComment(commentData: Comment): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseApiUrl}/comments/`, commentData, this.getAuthHeaders());
  }

  // =====================================================================
  // ATTACHMENT MODULE SUB-ENDPOINTS (MULTIPART PAYLOAD HANDLING)
  // =====================================================================
  uploadAttachment(taskId: number, file: File): Observable<TaskAttachment> {
    const formData = new FormData();
    formData.append('task', taskId.toString());
    formData.append('file', file);

    // Pass 'true' to signal multipart handling and omit manual application/json configurations
    return this.http.post<TaskAttachment>(`${this.baseApiUrl}/attachments/`, formData, this.getAuthHeaders(true));
  }
}