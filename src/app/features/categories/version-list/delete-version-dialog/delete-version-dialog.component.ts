import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

interface VersionDialogData {
  id: string;
  name: string;
}

@Component({
  selector: 'app-delete-version-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2><mat-icon>delete</mat-icon> Delete Version</h2>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete this version?</p>
        <p class="version-name">"{{ data.name }}"</p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <div class="dialog-actions">        <button type="button" mat-button (click)="onCancel()" class="secondary">Cancel</button>
        <button type="button" mat-button (click)="onConfirm()" [disabled]="loading" class="primary">
          <span *ngIf="!loading">Delete</span>
          <mat-spinner *ngIf="loading" diameter="20" color="primary"></mat-spinner>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .version-name {
      font-weight: 500;
      color: var(--text-primary);
      margin: var(--spacing-md) 0;
    }

    .warning-text {
      color: var(--error-color);
      font-size: var(--font-size-base);
      margin-top: var(--spacing-sm);
    }
  `],
  standalone: false
})
export class DeleteVersionDialogComponent {
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<DeleteVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VersionDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}