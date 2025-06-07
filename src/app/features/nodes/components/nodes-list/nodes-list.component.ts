import { Component, OnInit } from '@angular/core';
import { NodeRegistrationService } from '../../../../services/node-registration.service';
import { MatDialog } from '@angular/material/dialog';
import { AttributeWindowComponent } from '../attribute-window/attribute-window.component';
import { CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-nodes-list',
  templateUrl: `./nodes-list.component.html`,
  styleUrls: ['./nodes-list.component.scss'],
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

  onDragStarted(event: CdkDragStart, node: any) {
    const sourceElement = event.source.element.nativeElement;
    const previewElement = sourceElement.cloneNode(true) as HTMLElement;
    
    // Set preview element styles
    previewElement.classList.add('cdk-drag-preview');
    previewElement.style.position = 'fixed';
    previewElement.style.pointerEvents = 'none';
    previewElement.style.zIndex = '9999';
    previewElement.style.width = sourceElement.offsetWidth + 'px';
    previewElement.style.height = sourceElement.offsetHeight + 'px';
    previewElement.style.margin = '0';
    previewElement.style.transform = 'none';
    
    // Add preview to body
    document.body.appendChild(previewElement);

    // Track mouse position for preview
    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      previewElement.style.left = `${moveEvent.pageX - sourceElement.offsetWidth / 2}px`;
      previewElement.style.top = `${moveEvent.pageY - sourceElement.offsetHeight / 2}px`;
    };

    // Add and remove event listeners
    document.addEventListener('mousemove', mouseMoveHandler);
    event.source.ended.subscribe(() => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      previewElement.remove();
    });
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