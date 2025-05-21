import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

interface ExcelVersionDialogData {
  categoryId: string;
}

@Component({
  selector: 'app-excel-version-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2>Add Excel Version</h2>
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
            <label>Excel File</label>
            <div class="file-upload-container">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept=".xlsx,.xls" style="display: none">
              <div class="file-upload-box" (click)="fileInput.click()" [class.has-file]="selectedFile">
                <mat-icon>{{ selectedFile ? 'description' : 'upload_file' }}</mat-icon>
                <span>{{ selectedFile ? selectedFile.name : 'Click to upload Excel file' }}</span>
              </div>
            </div>
            <div class="error-message" *ngIf="!selectedFile && isSubmitted">
              Excel file is required
            </div>
          </div>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="loading">
            <span *ngIf="!loading">Create Version</span>
            <div *ngIf="loading" class="spinner"></div>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 500px;
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

    .file-upload-container {
      margin-top: 8px;
    }

    .file-upload-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px dashed #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .file-upload-box:hover {
      border-color: #4a90e2;
      background: rgba(74, 144, 226, 0.05);
    }

    .file-upload-box.has-file {
      border-style: solid;
      border-color: #4a90e2;
      background: rgba(74, 144, 226, 0.05);
    }

    .file-upload-box mat-icon {
      font-size: 24px;
      color: #4a90e2;
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
export class ExcelVersionDialogComponent {
  versionForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  isSubmitted = false;

  constructor(
    private dialogRef: MatDialogRef<ExcelVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExcelVersionDialogData,
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.versionForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        this.selectedFile = file;
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        input.value = '';
        this.selectedFile = null;
      }
    }
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.versionForm.valid && this.selectedFile) {
      this.loading = true;
      
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('name', this.versionForm.get('name')?.value);
      formData.append('description', this.versionForm.get('description')?.value);
      formData.append('type', 'excel');

      this.http.post(`http://localhost:3000/api/categories/${this.data.categoryId}/versions/upload`, formData)
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error uploading version:', error);
            alert('Failed to upload version. Please try again.');
            this.loading = false;
          }
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}