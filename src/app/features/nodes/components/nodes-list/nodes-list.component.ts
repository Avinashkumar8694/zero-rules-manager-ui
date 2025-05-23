import { Component, OnInit } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MatDialog } from '@angular/material/dialog';
import { AttributeWindowComponent } from '../attribute-window/attribute-window.component';

@Component({
  selector: 'app-nodes-list',
  template: `
    <div class="nodes-container">
      <div class="nodes-header">
        <h2>Available Nodes</h2>
        <button mat-raised-button color="primary" (click)="loadDefaultNodes()">Load Default Nodes</button>
      </div>
      <div class="nodes-list">
        <div *ngFor="let node of registeredNodes" class="node-item">
          <div class="node-info">
            <span class="node-type">{{ node.type }}</span>
            <span class="node-category">{{ node.appearance?.category }}</span>
          </div>
          <button mat-raised-button color="accent" (click)="editNode(node)">Edit</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nodes-container {
      padding: 1rem;
    }
    .nodes-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .nodes-list {
      display: grid;
      gap: 1rem;
    }
    .node-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #dee2e6;
    }
    .node-info {
      display: flex;
      flex-direction: column;
    }
    .node-type {
      font-weight: bold;
    }
    .node-category {
      font-size: 0.875rem;
      color: #6c757d;
    }
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #007bff;
      color: white;
    }
  `],
  standalone: false
})
export class NodesListComponent implements OnInit {
  registeredNodes: any[] = [];
  selectedNode: any = null;

  constructor(
    private nodeRegistrationService: NodeRegistrationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.updateNodesList();
  }

  loadDefaultNodes() {
    const defaultNodes = [
      '/assets/nodes/FileIn.html',
      // Add more default node paths here
    ];

    this.nodeRegistrationService.loadNodeDefinitions(defaultNodes).subscribe({
      next: () => {
        console.log('Default nodes loaded successfully');
        this.updateNodesList();
      },
      error: (error) => console.error('Error loading default nodes:', error)
    });
  }

  private updateNodesList() {
    const nodes = this.nodeRegistrationService.getAllNodeDefinitions();
    this.registeredNodes = Array.from(nodes.values());
  }

  editNode(node: any) {
    const dialogRef = this.dialog.open(AttributeWindowComponent, {
      width: '400px',
      height: '100vh',
      position: { right: '0' },
      data: { selectedNode: node }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Saving node:', result);
        // Handle node save logic
      }
    });
  }
}