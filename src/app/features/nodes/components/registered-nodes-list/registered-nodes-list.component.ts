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
  styles: [`
    .registered-nodes-container {
      padding: 16px;
      height: 100%;
      overflow-y: auto;
    }

    .nodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .node-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: move;
      display: flex;
      align-items: center;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
    }

    .node-icon {
      margin-right: 16px;

      mat-icon {
        color: #5c6bc0;
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .node-content {
      flex: 1;
    }

    .node-title {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .node-description {
      margin: 0;
      font-size: 12px;
      color: #666;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `],
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