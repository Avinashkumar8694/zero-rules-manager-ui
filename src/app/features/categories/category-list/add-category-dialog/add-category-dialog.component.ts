import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-add-category-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2>{{ data ? 'Edit' : 'Add New' }} Category</h2>
      </div>
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <div class="form-field">
            <label>Name</label>
            <input type="text" formControlName="name" placeholder="Enter category name">
            <div class="error-message" *ngIf="categoryForm.get('name')?.errors?.['required'] && categoryForm.get('name')?.touched">
              Name is required
            </div>
          </div>

          <div class="form-field">
            <label>Description</label>
            <textarea formControlName="description" placeholder="Enter category description" rows="3"></textarea>
            <div class="error-message" *ngIf="categoryForm.get('description')?.errors?.['required'] && categoryForm.get('description')?.touched">
              Description is required
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="categoryForm.invalid || loading">
            <span *ngIf="!loading">{{ data ? 'Update' : 'Create' }} Category</span>
            <div *ngIf="loading" class="spinner"></div>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-width: 400px;
    }    .dialog-header {
      /* Enhanced header styling applied globally via styles.scss */
    }

    .dialog-header h2 {
      margin: 0;
    }

    .dialog-content {
      padding: 24px;
    }

    .form-field {
      margin-bottom: 20px;
    }

    .form-field label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #555;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-field input:focus,
    .form-field textarea:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
    }

    .error-message {
      color: #dc3545;
      font-size: 12px;
      margin-top: 4px;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-primary,
    .btn-secondary {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #4a90e2;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background: #357abd;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover {
      background: #f5f5f5;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #ffffff;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
  standalone: false
})
export class AddCategoryDialogComponent {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data?: { id: string; name: string; description: string }
  ) {
    this.categoryForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || '', Validators.required]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.loading = true;
      const endpoint = this.data
        ? `${environment.apiBaseUrl}/categories/${this.data.id}`
        : `${environment.apiBaseUrl}/categories`;
      const method = this.data ? 'put' : 'post';
      
      this.http[method](endpoint, this.categoryForm.value)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.loading = false;
          }
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}