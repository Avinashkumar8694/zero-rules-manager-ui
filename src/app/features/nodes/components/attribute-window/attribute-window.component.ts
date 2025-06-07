import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, Inject } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-attribute-window',  template: `
    <div class="attribute-window" *ngIf="data.selectedNode">
      <div class="header">
        <h3>{{ formatHeader(data.selectedNode.type) }}</h3>        <div class="header-icons">
          <button mat-icon-button (click)="onSave()" matTooltip="Save changes">
            <mat-icon>save</mat-icon>
          </button>
          <button mat-icon-button (click)="onCancel()" matTooltip="Close">
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
    }    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 2.5rem;
      min-height: 2.5rem;
      background: #ffffff;
      color: var(--text-primary);
      padding: 0 16px;
      border-bottom: 1px solid rgba(108, 99, 255, 0.1);
      border-radius: 8px 8px 0 0;
      box-shadow: 0 2px 12px rgba(108, 99, 255, 0.15), 
                  0 1px 3px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 10;
      overflow: hidden;
    }.header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, rgba(108, 99, 255, 0.02) 0%, transparent 100%);
      pointer-events: none;
    }    .header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
      z-index: 1;
      position: relative;
    }.header-icons {
      display: flex;
      gap: 0.5rem;
      z-index: 2;
      position: relative;
      align-items: center;
      
      ::ng-deep {
        .mat-icon {
          font-size: 18px !important;
          width: 18px !important;
          height: 18px !important;
          line-height: 18px;
          color: var(--primary-color) !important;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
        }

        .mat-icon-button {
          width: 32px !important;
          height: 32px !important;
          line-height: 32px;
          color: var(--primary-color) !important;
          background: rgba(108, 99, 255, 0.05);
          border: 1px solid rgba(108, 99, 255, 0.1);
          border-radius: 6px;
          
          &:hover {
            background-color: rgba(108, 99, 255, 0.15) !important;
            border-color: var(--primary-color);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(108, 99, 255, 0.2);
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