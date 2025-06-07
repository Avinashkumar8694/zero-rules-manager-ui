import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-category-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2>Delete Category</h2>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete this category?</p>
        <p class="category-name">"{{ data.name }}"</p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
        <button type="button" class="btn-danger" (click)="onConfirm()" [disabled]="loading">
          <span *ngIf="!loading">Delete</span>
          <div *ngIf="loading" class="spinner"></div>
        </button>
      </div>
    </div>
  `,
  styles: [`    .dialog-container {
      /* Use global dialog styles for proper flexbox layout and sticky footer */
      min-width: 400px;
    }.dialog-header {
      /* Enhanced header styling applied globally via styles.scss */
    }

    .dialog-header h2 {
      margin: 0;
    }    .dialog-content {
      /* Content styling handled by global styles.scss */
      text-align: center;
    }

    .category-name {
      font-weight: 500;
      color: #333;
      margin: 12px 0;
    }

    .warning-text {
      color: #dc3545;
      font-size: 14px;
      margin-top: 8px;
    }    .dialog-actions {
      /* Sticky footer styling handled by global styles.scss */
    }

    .btn-secondary,
    .btn-danger {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: white;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-secondary:hover {
      background: #f5f5f5;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
      border: none;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-danger:disabled {
      background: #e9a5ac;
      cursor: not-allowed;
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