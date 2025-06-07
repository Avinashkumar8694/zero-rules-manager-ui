import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-category-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2><mat-icon>delete</mat-icon> Delete Category</h2>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete this category?</p>
        <p class="category-name">"{{ data.name }}"</p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <div class="dialog-actions">        <button type="button" mat-button (click)="onCancel()" class="secondary">Cancel</button>
        <button type="button" mat-button (click)="onConfirm()" [disabled]="loading" class="primary">
          <span *ngIf="!loading">Delete</span>
          <mat-spinner diameter="20" color="primary" *ngIf="loading"></mat-spinner>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .category-name {
      font-weight: 500;
      color: var(--text-primary);
      margin: var(--spacing-md) 0;
    }

    .warning-text {
      color: var(--error-color);
      font-size: var(--font-size-base);
      margin-top: var(--spacing-sm);
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
  standalone: false,
})
export class DeleteCategoryDialogComponent {
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<DeleteCategoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string; name: string }
  ) {}

  onConfirm() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}