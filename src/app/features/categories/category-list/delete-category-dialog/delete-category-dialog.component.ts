import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-category-dialog',
  template: `    <div class="dialog-container">
      <div class="dialog-header">
        <h2><mat-icon>delete</mat-icon> Delete Category</h2>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete this category?</p>
        <p class="highlighted-text">"{{ data.name }}"</p>
        <p class="warning-text"><mat-icon>warning</mat-icon> This action cannot be undone.</p>
      </div>
      <div class="dialog-actions">
        <button mat-flat-button (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="warn" (click)="onConfirm()" [disabled]="loading">
          <span *ngIf="!loading">Delete</span>
          <mat-spinner *ngIf="loading" diameter="20" color="primary"></mat-spinner>
        </button>
      </div>
    </div>
  `,  styles: [``],
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