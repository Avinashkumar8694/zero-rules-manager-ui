import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, Inject } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-attribute-window',  template: `
    <div class="attribute-window" *ngIf="data.selectedNode">
      <div class="header">
        <h3>{{ formatHeader(data.selectedNode.type) }}</h3>
        <div class="header-icons">
          <button mat-icon-button (click)="onSave()">
            <mat-icon>save</mat-icon>
          </button>
          <button mat-icon-button (click)="onCancel()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      <div class="node-template-container">
        <!-- Node template will be dynamically injected here -->
      </div>
    </div>
  `,
  styles: [`
    .attribute-window {
      width: 100%;
      max-width: 600px;
      margin: auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 48px;
      background: linear-gradient(135deg, #f8fafd 0%, #edf1f7 100%);
      border-bottom: 1px solid #e0e4e8;
      // border-radius: 12px;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #2a3b4d;
    }    .header-icons {
      display: flex;
      gap: 0.5rem;
      
      ::ng-deep {
        .mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
          line-height: 20px;
          color: #5f6368;
        }

        .mat-icon-button {
          width: 36px;
          height: 36px;
          line-height: 36px;
          
          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
      }
    }

    .node-template-container {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .node-template-container::-webkit-scrollbar {
      width: 6px;
    }

    .node-template-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .node-template-container::-webkit-scrollbar-thumb {
      background: #c1c9d6;
      border-radius: 3px;
    }

    .node-template-container::-webkit-scrollbar-thumb:hover {
      background: #a3adb9;
    }
  `], 
  standalone: false
})
export class AttributeWindowComponent implements AfterViewInit {
  nodeTemplate: string = '';

  constructor(
    private nodeRegistrationService: NodeRegistrationService,
    public dialogRef: MatDialogRef<AttributeWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedNode: any }
  ) {}

  ngAfterViewInit() {
    if (this.data.selectedNode) {
      const nodeDef = this.nodeRegistrationService.getNodeDefinition(this.data.selectedNode.type);
      if (nodeDef) {
        // Initialize node template and setup any required listeners
        this.setupNodeTemplate(nodeDef);
      }
    }
  }

  private setupNodeTemplate(nodeDef: any) {
    if (nodeDef.template) {
      // Wait for container to be available in the DOM
      setTimeout(() => {
        const container = document.querySelector('.node-template-container');
        if (!container) {
          console.error('Node template container not found');
          return;
        }
        container.innerHTML = nodeDef.template;
        // Setup form elements after template is rendered
        this.setupFormElements();
      }, 100);
    }
  }

  private setupFormElements() {
    // Setup radio buttons
    const radioGroups = document.querySelectorAll('[form-radio]');
    radioGroups.forEach(radio => {
      if (radio instanceof HTMLInputElement) {
        radio.addEventListener('change', () => this.updateNodeProperty(radio.name, radio.value));
      }
    });

    // Setup text inputs
    const inputs = document.querySelectorAll('.node-input-property');
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.addEventListener('input', () => this.updateNodeProperty(input.id.replace('node-input-', ''), input.value));
      }
    });
  }

  private updateNodeProperty(property: string, value: any) {
    if (this.data.selectedNode && this.data.selectedNode.nodeDef) {
      this.data.selectedNode.nodeDef[property] = value;
    }
  }

  onSave() {
    // Collect values from the form and close dialog with values
    const values = this.collectFormValues();
    this.dialogRef.close(values);
  }

  onCancel() {
    this.dialogRef.close();
  }

  private collectFormValues(): any {
    if (!this.data.selectedNode || !this.data.selectedNode) {
      return {};
    }
    return { ...this.data.selectedNode }
  }

  formatHeader(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  }
}