import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, Comment, TaskAttachment } from '../../../core/task.service';

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
  
  // Role Authentication Tracking
  isSuperUser: boolean = false; 

  // Form Input & State Control Bindings
  title: string = '';
  description: string = '';
  assignedTo: number | null = null;
  taskStatus: 'pending' | 'in_progress' | 'completed' = 'pending'; 
  
  showForm: boolean = false;
  isEditing: boolean = false; 
  showEmployeeStatusForm: boolean = false; 
  editingTaskId: number | null = null; 

  // Filtering & Query Search States
  filterStatus: string = '';
  filterAssignedTo: string = '';
  searchText: string = '';

  // Context input comment strings
  newCommentContent: string = '';
  
  // Track runtime file system uploads
  selectedFile: File | null = null;

  constructor(private taskService: TaskService) {}

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
    const activeFilters = {
      status: this.filterStatus || undefined,
      assigned_to: this.filterAssignedTo || undefined,
      search: this.searchText.trim() || undefined
    };

    this.taskService.getTasks(activeFilters).subscribe({
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
    this.taskService.getTaskById(taskId).subscribe({
      next: (freshTask) => {
        this.selectedTask = freshTask;
      },
      error: (err: any) => console.error('Error auto-syncing detailed object context view container', err)
    });
  }

  saveTask(): void {
    if (!this.isSuperUser) {
      this.errorMessage = 'Permission Denied: Only administrators or managers can complete this action.';
      return;
    }
    if (!this.title.trim()) return;

    const taskPayload: Partial<Task> = {
      title: this.title,
      description: this.description,
      status: this.taskStatus,
      assigned_to: this.assignedTo ? Number(this.assignedTo) : 0
    };

    if (this.isEditing && this.editingTaskId) {
      this.taskService.updateTask(this.editingTaskId, taskPayload).subscribe({
        next: () => {
          this.resetFormState();
          this.getTasks();
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to update task record parameters.';
          console.error(err);
        }
      });
    } else {
      this.taskService.createTask(taskPayload).subscribe({
        next: () => {
          this.resetFormState();
          this.getTasks();
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to assign task layout requirements.';
          console.error(err);
        }
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

    const statusPayload: Partial<Task> = { status: this.taskStatus };

    this.taskService.updateTask(this.editingTaskId, statusPayload).subscribe({
      next: () => {
        this.resetFormState();
        this.getTasks();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to update progress status fields.';
        console.error(err);
      }
    });
  }

  submitComment(): void {
    if (!this.selectedTask?.id || !this.newCommentContent.trim()) return;

    const commentPayload: Comment = {
      task: this.selectedTask.id,
      content: this.newCommentContent.trim()
    };

    this.taskService.addComment(commentPayload).subscribe({
      next: () => {
        this.newCommentContent = '';
        this.syncSelectedTaskDetails(this.selectedTask!.id!);
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to drop remark onto task tracking record.';
        console.error(err);
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submitAttachment(): void {
    if (!this.selectedTask?.id || !this.selectedFile) return;

    this.taskService.uploadAttachment(this.selectedTask.id, this.selectedFile).subscribe({
      next: () => {
        this.selectedFile = null;
        this.syncSelectedTaskDetails(this.selectedTask!.id!);
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to attach file stream asset to targeted task frame.';
        console.error(err);
      }
    });
  }

  toggleCreateForm(): void {
    this.isEditing = false;
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetInputBindings();
    }
  }

  cancelForm(): void {
    this.resetFormState();
  }

  private resetFormState(): void {
    this.showForm = false;
    this.isEditing = false;
    this.showEmployeeStatusForm = false;
    this.editingTaskId = null;
    this.resetInputBindings();
  }

  private resetInputBindings(): void {
    this.title = '';
    this.description = '';
    this.assignedTo = null;
    this.taskStatus = 'pending';
  }

  viewDetails(task: Task): void {
    if (task.id) {
      this.syncSelectedTaskDetails(task.id);
    }
  }

  closeDetails(): void {
    this.selectedTask = null;
  }

  deleteTask(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (!this.isSuperUser) {
      alert('Access Denied: You do not have permissions to perform modifications.');
      return;
    }
    if (!id || !confirm('Are you sure you want to delete this task record?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        if (this.selectedTask?.id === id) this.selectedTask = null;
        this.getTasks();
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to delete task. Action rejected by security guidelines.';
        console.error(err);
      }
    });
  }
}