import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AttributeWindowData {
  type: 'node' | 'connection';
  data: any;
}

@Component({
  selector: 'app-attribute-window',
  template: `
    <div class="attribute-window">
      <div class="attribute-header">
        <h2>{{ data.type === 'node' ? 'Node Properties' : 'Connection Properties' }}</h2>
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="attribute-content" *ngIf="data.type === 'node'">
        <div class="attribute-row">
          <span class="attribute-label">Type:</span>
          <span class="attribute-value">{{ data.data.type }}</span>
        </div>
        <div class="attribute-row">
          <span class="attribute-label">Name:</span>
          <span class="attribute-value">{{ data.data.name }}</span>
        </div>
        <div class="attribute-row">
          <span class="attribute-label">Description:</span>
          <span class="attribute-value">{{ data.data.config?.metadata?.description }}</span>
        </div>
      </div>

      <div class="attribute-content" *ngIf="data.type === 'connection'">
        <div class="attribute-row">
          <span class="attribute-label">Name:</span>
          <span class="attribute-value">{{ data.data.name || 'Unnamed Connection' }}</span>
        </div>
        <div class="attribute-row">
          <span class="attribute-label">Condition:</span>
          <span class="attribute-value">{{ data.data.condition || 'No Condition' }}</span>
        </div>
        <div class="attribute-row">
          <span class="attribute-label">Source:</span>
          <span class="attribute-value">{{ data.data.source.nodeId }} (Port: {{ data.data.source.outputIndex }})</span>
        </div>
        <div class="attribute-row">
          <span class="attribute-label">Target:</span>
          <span class="attribute-value">{{ data.data.target.nodeId }} (Port: {{ data.data.target.inputIndex }})</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .attribute-window {
      min-width: 300px;
      max-width: 500px;
      padding: 0;
    }

    .attribute-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }
    }

    .attribute-content {
      padding: 16px;
    }

    .attribute-row {
      display: flex;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }

    .attribute-label {
      width: 100px;
      color: #666;
      font-weight: 500;
    }

    .attribute-value {
      flex: 1;
      color: #333;
      background: #f8f8f8;
      padding: 4px 8px;
      border-radius: 4px;
      word-break: break-word;
    }
  `], 
  standalone: false
})
export class AttributeWindowComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AttributeWindowData,
    private dialogRef: MatDialogRef<AttributeWindowComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}