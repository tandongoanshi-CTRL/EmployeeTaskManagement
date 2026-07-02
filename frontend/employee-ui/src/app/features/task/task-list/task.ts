import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Task, Comment } from '../../../core/task.service';
// 🛠️ Fixed path: Adding one more level up to find the environments folder
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task.html',
  styleUrls: ['./task.css']
})
export class TaskComponent implements OnInit {
  
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  errorMessage: string = '';
  isSuperUser: boolean = false; 

  title: string = '';
  description: string = '';
  assignedTo: number | null = null;
  taskStatus: 'pending' | 'in_progress' | 'completed' = 'pending'; 
  
  showForm: boolean = false;
  isEditing: boolean = false; 
  showEmployeeStatusForm: boolean = false; 
  editingTaskId: number | null = null; 

  filterStatus: string = '';
  filterAssignedTo: string = '';
  searchText: string = '';

  newCommentContent: string = '';
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.getTasks();
  }

  private checkUserRole(): void {
    const role = localStorage.getItem('user_role');
    const superuserStatus = localStorage.getItem('is_superuser');
    this.isSuperUser = role === 'admin' || role === 'manager' || superuserStatus === 'true';
  }

  getTasks(): void {
    const activeFilters: any = {};
    if (this.filterStatus) activeFilters.status = this.filterStatus;
    if (this.filterAssignedTo) activeFilters.assigned_to = this.filterAssignedTo;
    if (this.searchText.trim()) activeFilters.search = this.searchText.trim();

    this.http.get<Task[]>(`${environment.apiUrl}/tasks/`, { params: activeFilters }).subscribe({
      next: (data) => {
        this.tasks = Array.isArray(data) ? data : [];
        this.errorMessage = '';
        if (this.selectedTask && this.selectedTask.id) {
          this.syncSelectedTaskDetails(this.selectedTask.id);
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Could not fetch tasks. Please verify your connection status or permissions.';
        console.error(err);
      }
    });
  }

  private syncSelectedTaskDetails(taskId: number): void {
    this.http.get<Task>(`${environment.apiUrl}/tasks/${taskId}/`).subscribe({
      next: (freshTask) => {
        this.selectedTask = freshTask;
      },
      error: (err: any) => console.error(err)
    });
  }

  saveTask(): void {
    if (!this.isSuperUser) {
      this.errorMessage = 'Permission Denied: Only administrators or managers can complete this action.';
      return;
    }
    if (!this.title.trim()) return;

    const taskPayload = {
      title: this.title,
      description: this.description,
      status: this.taskStatus,
      assigned_to: this.assignedTo ? Number(this.assignedTo) : 0
    };

    if (this.isEditing && this.editingTaskId) {
      this.http.put(`${environment.apiUrl}/tasks/${this.editingTaskId}/`, taskPayload).subscribe({
        next: () => { this.resetFormState(); this.getTasks(); },
        error: (err: any) => console.error(err)
      });
    } else {
      this.http.post(`${environment.apiUrl}/tasks/`, taskPayload).subscribe({
        next: () => { this.resetFormState(); this.getTasks(); },
        error: (err: any) => console.error(err)
      });
    }
  }

  startEditTask(task: Task): void {
    this.isEditing = true;
    this.showForm = true;
    this.showEmployeeStatusForm = false;
    this.editingTaskId = task.id || null;
    this.title = task.title;
    this.description = task.description || '';
    this.assignedTo = task.assigned_to || null;
    this.taskStatus = task.status || 'pending';
  }

  startEmployeeStatusEdit(task: Task): void {
    this.showEmployeeStatusForm = true;
    this.showForm = false;
    this.editingTaskId = task.id || null;
    this.title = task.title;
    this.taskStatus = task.status || 'pending';
  }

  submitEmployeeStatusUpdate(): void {
    if (!this.editingTaskId) return;
    this.http.patch(`${environment.apiUrl}/tasks/${this.editingTaskId}/`, { status: this.taskStatus }).subscribe({
      next: () => { this.resetFormState(); this.getTasks(); },
      error: (err: any) => console.error(err)
    });
  }

  submitComment(): void {
    if (!this.selectedTask?.id || !this.newCommentContent.trim()) return;
    const commentPayload = { task: this.selectedTask.id, content: this.newCommentContent.trim() };

    this.http.post(`${environment.apiUrl}/comments/`, commentPayload).subscribe({
      next: () => { this.newCommentContent = ''; this.syncSelectedTaskDetails(this.selectedTask!.id!); },
      error: (err: any) => console.error(err)
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  submitAttachment(): void {
    if (!this.selectedTask?.id || !this.selectedFile) return;
    const formData = new FormData();
    formData.append('task', this.selectedTask.id.toString());
    formData.append('file', this.selectedFile);

    this.http.post(`${environment.apiUrl}/attachments/`, formData).subscribe({
      next: () => { this.selectedFile = null; this.syncSelectedTaskDetails(this.selectedTask!.id!); },
      error: (err: any) => console.error(err)
    });
  }

  toggleCreateForm(): void { this.isEditing = false; this.showForm = !this.showForm; if (this.showForm) this.resetInputBindings(); }
  cancelForm(): void { this.resetFormState(); }
  private resetFormState(): void { this.showForm = false; this.isEditing = false; this.showEmployeeStatusForm = false; this.editingTaskId = null; this.resetInputBindings(); }
  private resetInputBindings(): void { this.title = ''; this.description = ''; this.assignedTo = null; this.taskStatus = 'pending'; }
  viewDetails(task: Task): void { if (task.id) this.syncSelectedTaskDetails(task.id); }
  closeDetails(): void { this.selectedTask = null; }

  deleteTask(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (!this.isSuperUser) { alert('Access Denied: You do not have permissions.'); return; }
    if (!id || !confirm('Are you sure you want to delete this task record?')) return;

    this.http.delete(`${environment.apiUrl}/tasks/${id}/`).subscribe({
      next: () => { if (this.selectedTask?.id === id) this.selectedTask = null; this.getTasks(); },
      error: (err: any) => console.error(err)
    });
  }
}