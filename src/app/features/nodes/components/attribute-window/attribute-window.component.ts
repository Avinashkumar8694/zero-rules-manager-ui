import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, Inject } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-attribute-window',
  template: `
    <div class="attribute-window" *ngIf="data.selectedNode">
      <div class="header">
        <h3>{{ data.selectedNode.type }} Properties</h3>
      </div>
      <div class="node-template-container">
        <!-- Node template will be dynamically injected here -->
      </div>
      <div class="actions">
        <button mat-raised-button color="primary" (click)="onSave()">Save</button>
        <button mat-raised-button color="accent" (click)="onCancel()">Cancel</button>
      </div>
    </div>
  `,
  styles: [`
    .attribute-window {
      width: 100%;
      height: 100%;
      background: white;
      display: flex;
      flex-direction: column;
    }
    .header {
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }
    .node-template-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;
    }
    .actions {
      padding-top: 1rem;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
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
}