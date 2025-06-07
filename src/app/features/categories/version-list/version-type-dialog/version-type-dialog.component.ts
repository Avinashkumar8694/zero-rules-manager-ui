import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ExcelVersionDialogComponent } from '../excel-version-dialog/excel-version-dialog.component';
import { CodeVersionDialogComponent } from '../code-version-dialog/code-version-dialog.component';
import { FlowVersionDialogComponent } from '../flow-version-dialog/flow-version-dialog.component';

export interface VersionTypeDialogData {
    categoryId: string;
}

@Component({
    selector: 'app-version-type-dialog',
    template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2>Select Version Type</h2>
      </div>
      <div class="dialog-content">
        <div class="version-type-grid">
          <div class="version-type-card" (click)="selectVersionType('excel')">
            <mat-icon>table_chart</mat-icon>
            <h3>Excel Version</h3>
            <p>Upload and manage Excel-based rules</p>
          </div>
          <div class="version-type-card" (click)="selectVersionType('code')">
            <mat-icon>code</mat-icon>
            <h3>Code Version</h3>
            <p>Create and manage code-based rules</p>
          </div>
          <div class="version-type-card" (click)="selectVersionType('flow')">
            <mat-icon>account_tree</mat-icon>
            <h3>Flow Version</h3>
            <p>Design and manage flow-based rules</p>
          </div>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancel</button>
      </div>
    </div>
  `,
    styles: [`
    .dialog-container {
      min-width: 600px;
    }    .dialog-header {
      /* Enhanced header styling applied globally via styles.scss */
    }

    .dialog-header h2 {
      margin: 0;
    }

    .dialog-content {
      padding: 24px;
    }

    .version-type-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .version-type-card {
      padding: 24px;
      border: 1px solid #eee;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .version-type-card:hover {
      border-color: #4a90e2;
      box-shadow: 0 2px 8px rgba(74, 144, 226, 0.1);
    }

    .version-type-card mat-icon {
      font-size: 36px;
      height: 36px;
      width: 36px;
      color: #4a90e2;
      margin-bottom: 16px;
    }

    .version-type-card h3 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .version-type-card p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }
  `],
    standalone: false
})
export class VersionTypeDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<VersionTypeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: VersionTypeDialogData,
        private dialog: MatDialog
    ) { }

    selectVersionType(type: string) {
        let dialogRef;
        
        if (type === 'excel') {
            dialogRef = this.dialog.open(ExcelVersionDialogComponent, {
                width: '500px',
                disableClose: true,
                data: { categoryId: this.data.categoryId }
            });
        } else if (type === 'code') {
            dialogRef = this.dialog.open(CodeVersionDialogComponent, {
                width: 'auto',
                minWidth: '50rem',
                minHeight: '30rem',
                maxHeight: '91vh',
                disableClose: true,
                data: { categoryId: this.data.categoryId }
            });
        } else if (type === 'flow') {
            dialogRef = this.dialog.open(FlowVersionDialogComponent, {
                width: '500px',
                disableClose: true,
                data: { categoryId: this.data.categoryId }
            });
        }

        if (dialogRef) {
            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.dialogRef.close(result);
                }
            });
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}