import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-category-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>Add New Category</h2>
      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter category name">
            <mat-error *ngIf="categoryForm.get('name')?.errors?.['required']">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Enter category description" rows="3"></textarea>
            <mat-error *ngIf="categoryForm.get('description')?.errors?.['required']">
              Description is required
            </mat-error>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="categoryForm.invalid || loading">
            <mat-icon *ngIf="!loading">add</mat-icon>
            <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
            Create Category
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      min-width: 400px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-actions {
      padding: 16px 0 0;
      gap: 8px;
    }
    button[type="submit"] {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AddCategoryDialogComponent {
  categoryForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCategoryDialogComponent>,
    private http: HttpClient
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.loading = true;
      this.http.post('http://localhost:3000/api/categories', this.categoryForm.value)
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