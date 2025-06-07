import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-registered-nodes-list',  template: `    <div class="registered-nodes-container">      <div class="search-section palette">
        <div class="search-box compact">
          <mat-icon>search</mat-icon>
          <input type="text" 
                 placeholder="Search workflow component" 
                 [(ngModel)]="searchQuery" 
                 (ngModelChange)="filterNodes()">
        </div>
      </div>
      
      <div class="connector-section">
        <!-- <h3>Connector</h3> -->
        <!-- Connector dropdown can be added here later -->
      </div>
      
      <div class="nodes-section">
        <h3>Nodes</h3>
        <div class="nodes-grid">
          <div *ngFor="let node of filteredNodes" 
               class="node-card" 
               [cdkDragData]="node"
               cdkDrag
               (cdkDragStarted)="onDragStarted($event, node)">
            <div class="node-icon">
              <mat-icon>{{ getNodeIcon(node) }}</mat-icon>
            </div>
            <div class="node-label">{{ getNodeLabel(node) }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./registered-nodes-list.component.scss'],
  standalone: false
})
export class RegisteredNodesListComponent implements OnInit {
  registeredNodes: any[] = [];
  filteredNodes: any[] = [];
  searchQuery: string = '';
  @Output() nodeSelected = new EventEmitter<any>();

  constructor(private nodeRegistrationService: NodeRegistrationService) {}

  ngOnInit() {
    this.updateNodesList();
  }
  getNodeIcon(node: any): string {
    // Use the icon from the registered node's appearance or fallback to a default
    return node.appearance?.icon || node.icon || 'extension';
  }

  getNodeLabel(node: any): string {
    // Use the label from the registered node or fallback to type
    return node.label || node.type || 'Node';
  }
  filterNodes() {
    if (!this.searchQuery.trim()) {
      this.filteredNodes = [...this.registeredNodes];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredNodes = this.registeredNodes.filter(node => 
        node.type?.toLowerCase().includes(query) ||
        node.label?.toLowerCase().includes(query) ||
        node.description?.toLowerCase().includes(query) ||
        node.appearance?.category?.toLowerCase().includes(query)
      );
    }
  }

  onDragStarted(event: CdkDragStart, node: any) {
    const sourceElement = event.source.element.nativeElement;
    const previewElement = sourceElement.cloneNode(true) as HTMLElement;
    
    previewElement.classList.add('cdk-drag-preview');
    previewElement.style.position = 'fixed';
    previewElement.style.pointerEvents = 'none';
    previewElement.style.zIndex = '9999';
    previewElement.style.width = sourceElement.offsetWidth + 'px';
    previewElement.style.height = sourceElement.offsetHeight + 'px';
    previewElement.style.margin = '0';
    previewElement.style.transform = 'none';
    
    document.body.appendChild(previewElement);

    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      previewElement.style.left = `${moveEvent.pageX - sourceElement.offsetWidth / 2}px`;
      previewElement.style.top = `${moveEvent.pageY - sourceElement.offsetHeight / 2}px`;
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    event.source.ended.subscribe(() => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      previewElement.remove();
    });
  }
  private updateNodesList() {
    const nodes = this.nodeRegistrationService.getAllNodeDefinitions();
    this.registeredNodes = Array.from(nodes.values());
    this.filteredNodes = [...this.registeredNodes];
  }
}