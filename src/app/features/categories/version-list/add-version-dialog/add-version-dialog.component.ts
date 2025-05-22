import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

interface VersionDialogData {
  categoryId: string;
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-add-version-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2>{{ data.id ? 'Edit' : 'Add New' }} Version</h2>
      </div>
      <form [formGroup]="versionForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <div class="form-field">
            <label>Name</label>
            <input type="text" formControlName="name" placeholder="Enter version name">
            <div class="error-message" *ngIf="versionForm.get('name')?.errors?.['required'] && versionForm.get('name')?.touched">
              Name is required
            </div>
          </div>

          <div class="form-field">
            <label>Description</label>
            <textarea formControlName="description" placeholder="Enter version description" rows="3"></textarea>
            <div class="error-message" *ngIf="versionForm.get('description')?.errors?.['required'] && versionForm.get('description')?.touched">
              Description is required
            </div>
          </div>

          <div class="form-field">
            <label>Type</label>
            <select formControlName="type">
              <option value="excel">Excel</option>
              <option value="code">Code</option>
              <option value="flow">Flow</option>
            </select>
            <div class="error-message" *ngIf="versionForm.get('type')?.errors?.['required'] && versionForm.get('type')?.touched">
              Type is required
            </div>
          </div>

          <div class="form-field checkbox-field">
            <label>
              <input type="checkbox" formControlName="isActive">
              Active
            </label>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="versionForm.invalid || loading">
            <span *ngIf="!loading">{{ data.id ? 'Update' : 'Create' }} Version</span>
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
    }

    .dialog-header {
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
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
    .form-field textarea,
    .form-field select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-field input:focus,
    .form-field textarea:focus,
    .form-field select:focus {
      outline: none;
      border-color: #4a90e2;
      box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
    }

    .checkbox-field label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .checkbox-field input[type="checkbox"] {
      width: auto;
      margin: 0;
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
export class AddVersionDialogComponent {
  versionForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddVersionDialogComponent>,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: VersionDialogData
  ) {
    this.versionForm = this.fb.group({
      name: [data.name || '', Validators.required],
      description: [data.description || '', Validators.required],
      type: [data.type || 'excel', Validators.required],
      isActive: [data.isActive !== undefined ? data.isActive : true]
    });
  }

  onSubmit() {
    if (this.versionForm.valid) {
      this.loading = true;
      const endpoint = this.data.id
        ? `http://localhost:3000/api/categories/${this.data.categoryId}/versions/${this.data.id}`
        : `http://localhost:3000/api/categories/${this.data.categoryId}/versions`;
      const method = this.data.id ? 'put' : 'post';
      
      this.http[method](endpoint, this.versionForm.value)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error saving version:', error);
            this.loading = false;
          }
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}