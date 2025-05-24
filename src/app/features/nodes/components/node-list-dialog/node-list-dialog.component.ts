import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-node-list-dialog',
  template: `
    <div class="node-list-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Available Nodes</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <app-registered-nodes-list
          (nodeSelected)="onNodeSelected($event)">
        </app-registered-nodes-list>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .node-list-dialog {
      min-width: 600px;
      max-width: 800px;
      height: 80vh;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    mat-dialog-content {
      padding: 0;
      height: calc(80vh - 64px);
      overflow: hidden;
    }
  `],
  standalone: false,
})
export class NodeListDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<NodeListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  onNodeSelected(node: any): void {
    this.dialogRef.close(node);
  }
}