import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-registered-nodes-list',
  template: `
    <div class="registered-nodes-container">
      <div class="nodes-grid">
        <div *ngFor="let node of registeredNodes" 
             class="node-card" 
             [cdkDragData]="node"
             cdkDrag
             (cdkDragStarted)="onDragStarted($event, node)">
          <div class="node-icon">
            <mat-icon>{{ node.icon || 'extension' }}</mat-icon>
          </div>
          <div class="node-content">
            <h3 class="node-title">{{ node.type }}</h3>
            <p class="node-description">{{ node.description || 'No description available' }}</p>
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
  @Output() nodeSelected = new EventEmitter<any>();

  constructor(private nodeRegistrationService: NodeRegistrationService) {}

  ngOnInit() {
    this.updateNodesList();
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
  }
}