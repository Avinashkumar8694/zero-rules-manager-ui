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
        <h2><mat-icon>folder</mat-icon> {{ data ? 'Edit' : 'Add New' }} Category</h2>
      </div>
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="dialog-form">
        <div class="dialog-content">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter category name">
            <mat-error *ngIf="categoryForm.get('name')?.errors?.['required'] && categoryForm.get('name')?.touched">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Enter category description" rows="3"></textarea>
            <mat-error *ngIf="categoryForm.get('description')?.errors?.['required'] && categoryForm.get('description')?.touched">
              Description is required
            </mat-error>          </mat-form-field>
        </div>
        <div class="dialog-actions">
          <button mat-button type="button" (click)="onCancel()" class="secondary">Cancel</button>
          <button mat-button type="submit" [disabled]="categoryForm.invalid || loading" class="primary">
            <span *ngIf="!loading">{{ data ? 'Update' : 'Create' }} Category</span>
            <mat-spinner diameter="20" color="primary" *ngIf="loading"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`    .dialog-form {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .full-width {
      width: 100%;
      margin-bottom: var(--spacing-md);
    }

    mat-spinner {
      margin: 0 var(--spacing-sm);
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