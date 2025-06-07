import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface VersionDialogData {
  id: string;
  name: string;
}

@Component({
  selector: 'app-delete-version-dialog',  template: `
    <div class="dialog-container">
      <div class="dialog-content">
        <h2>Delete Version</h2>
        <p>Are you sure you want to delete version "{{ data.name }}"?</p>
        <p class="warning">This action cannot be undone.</p>
      </div>
      
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          Delete Version
        </button>
      </div>
    </div>
  `,  styles: [`
    .dialog-container {
      /* Use global dialog styles for proper flexbox layout and sticky footer */
      max-width: 400px;
    }

    .dialog-content {
      /* Content styling handled by global styles.scss */
      padding: 24px;
    }

    h2 {
      margin: 0 0 16px;
      color: #333;
    }

    p {
      margin: 0 0 16px;
      color: #666;
    }

    .warning {
      color: #d32f2f;
      font-weight: 500;
    }

    .dialog-actions {
      /* Dialog actions styling handled by global styles.scss with sticky footer functionality */
      margin-top: 24px;
    }
  `]
})
export class DeleteVersionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VersionDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}