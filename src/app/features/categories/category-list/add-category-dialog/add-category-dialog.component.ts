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
  template: `    <div class="dialog-container">
      <div class="dialog-header">
        <h2><mat-icon>folder</mat-icon> {{ data ? 'Edit' : 'Add New' }} Category</h2>
      </div>
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">        <div class="dialog-content">
          <div class="form-field">
            <label for="name">Name</label>
            <input id="name"
                   type="text"
                   class="mat-mdc-input-element"
                   formControlName="name"
                   placeholder="Enter category name">
            <div class="error-message" *ngIf="categoryForm.get('name')?.errors?.['required'] && categoryForm.get('name')?.touched">
              Name is required
            </div>
          </div>

          <div class="form-field">
            <label for="description">Description</label>
            <textarea id="description"
                      class="mat-mdc-input-element"
                      formControlName="description"
                      placeholder="Enter category description"
                      rows="3"></textarea>
            <div class="error-message" *ngIf="categoryForm.get('description')?.errors?.['required'] && categoryForm.get('description')?.touched">
              Description is required
            </div>
          </div>
        </div>
        <div class="dialog-actions">          <button mat-button (click)="onCancel()" class="secondary-button">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="categoryForm.invalid || loading" class="primary-button">
            <span *ngIf="!loading">{{ data ? 'Update' : 'Create' }} Category</span>
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      min-width: 500px;
      max-width: 600px;
      width: 100%;
    }    .dialog-header {
      width: 100%;
      height: 3.5rem;
      padding: 0 24px;
      background-color: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
    }

    .dialog-header h2 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .dialog-content {
      width: 100%;
      padding: 24px;
      box-sizing: border-box;
    }

    .form-field {
      width: 100%;
      margin-bottom: 20px;
    }

    .form-field:last-child {
      margin-bottom: 0;
    }

    .form-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .form-field input:focus,
    .form-field textarea:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
    }

    .error-message {
      color: var(--error-color);
      font-size: 12px;
      margin-top: 4px;
    }    .dialog-actions {
      width: 100%;
      height: 3.5rem;
      padding: 0 24px;
      background-color: #f8f9fa;
      border-top: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;
      box-sizing: border-box;
    }

    .dialog-actions button {
      min-width: 100px;
      height: 36px;
    }

    .dialog-actions button.mat-mdc-button {
      color: #666;
    }

    .dialog-actions button.mat-mdc-flat-button {
      background-color: var(--primary-color, #1976d2);
      color: white;
    }

    .mat-mdc-input-element {
      background-color: #fff;
    }

    mat-spinner {
      display: inline-block;
      margin-left: 8px;
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