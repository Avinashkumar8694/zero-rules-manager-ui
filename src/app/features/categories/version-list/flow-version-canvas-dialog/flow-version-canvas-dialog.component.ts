import {
    Component,
    ElementRef,
    ViewChild,
    Inject,
    AfterViewInit
  } from '@angular/core';
  import { MAT_DIALOG_DATA } from '@angular/material/dialog';
  import { CdkDragStart, CdkDragMove } from '@angular/cdk/drag-drop';
  
  @Component({
    selector: 'app-flow-version-canvas-dialog',
    templateUrl: './flow-version-canvas-dialog.component.html',
    styleUrls: ['./flow-version-canvas-dialog.component.scss'],
    standalone: false
  })
  export class FlowVersionCanvasDialogComponent implements AfterViewInit {
    @ViewChild('canvasBoundary', { static: true }) canvasBoundary!: ElementRef;
  
    scale = 1;
    dragOffset = { x: 0, y: 0 };
    canvasMinWidth = 1000; // default canvas width
    canvasMinHeight = 1000;
  
    nodes: { [key: string]: any } = {
      node1: { position: { x: 50, y: 100 }, type: 'start', appearance: { color: '#f44336' } },
      node2: { position: { x: 300, y: 200 }, type: 'process', appearance: { color: '#2196f3' } },
      node3: { position: { x: 600, y: 400 }, type: 'end', appearance: { color: '#4caf50' } }
    };
  
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  
    ngAfterViewInit(): void {}
  
    zoomIn() {
      this.scale = Math.min(2, this.scale + 0.1);
    }
  
    zoomOut() {
      this.scale = Math.max(0.1, this.scale - 0.1);
    }
  
    onDragStart(event: CdkDragStart, nodeId: string) {
      const nodeElem = event.source.element.nativeElement as HTMLElement;
      const nodeRect = nodeElem.getBoundingClientRect();
      const pointerEvent = event.event as MouseEvent | PointerEvent;
  
      this.dragOffset = {
        x: (pointerEvent.clientX - nodeRect.left) / this.scale,
        y: (pointerEvent.clientY - nodeRect.top) / this.scale
      };
    }
  
    onNodeMoved(event: CdkDragMove, nodeId: string) {
        const scrollContainer = this.canvasBoundary.nativeElement as HTMLElement;
        const canvasArea = scrollContainer.querySelector('.canvas-area') as HTMLElement;
        const canvasRect = canvasArea.getBoundingClientRect();
      
        const pointerX = event.pointerPosition.x;
        const pointerY = event.pointerPosition.y;
      
        const localX = (pointerX - canvasRect.left + scrollContainer.scrollLeft) / this.scale - this.dragOffset.x;
        const localY = (pointerY - canvasRect.top + scrollContainer.scrollTop) / this.scale - this.dragOffset.y;
      
        this.nodes[nodeId].position = { x: localX, y: localY };
      
        const buffer = 300;
        const nodeRight = localX + 120;
        const nodeBottom = localY + 80;
      
        // Dynamically increase minWidth and minHeight tracked by variables
        const requiredMinWidth = (nodeRight + buffer);
        if (requiredMinWidth > this.canvasMinWidth) {
          this.canvasMinWidth = requiredMinWidth;
        }
      
        const requiredMinHeight = (nodeBottom + buffer);
        if (requiredMinHeight > this.canvasMinHeight) {
          this.canvasMinHeight = requiredMinHeight;
        }
      
        // Auto-scroll logic (optional)
        const edge = 50;
        const scrollBounds = scrollContainer.getBoundingClientRect();
      
        if (pointerX > scrollBounds.right - edge) scrollContainer.scrollLeft += 20;
        else if (pointerX < scrollBounds.left + edge) scrollContainer.scrollLeft -= 20;
      
        if (pointerY > scrollBounds.bottom - edge) scrollContainer.scrollTop += 20;
        else if (pointerY < scrollBounds.top + edge) scrollContainer.scrollTop -= 20;
      }
      
  
    saveCanvas() {
      console.log('Saving canvas...', this.nodes);
    }
  
    onClose() {}
  }
  