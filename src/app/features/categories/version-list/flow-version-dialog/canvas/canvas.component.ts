import { Component, ViewChild, ElementRef } from '@angular/core';
import { CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  standalone: false
})
export class CanvasComponent {
  scale = 1;
  nodes = [
    { id: 1, position: { x: 100, y: 100 } },
    { id: 2, position: { x: 300, y: 200 } }
  ];

  @ViewChild('canvasWrapper', { static: true }) canvasWrapper!: ElementRef;

  zoomIn() {
    this.scale += 0.1;
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale - 0.1);
  }

  resetZoom() {
    this.scale = 1;
  }

  onDragStarted(event: CdkDragStart, node: any) {
    // handle drag start
  }

  onDragEnded(event: CdkDragEnd, node: any) {
    node.position = {
      x: event.source.getFreeDragPosition().x,
      y: event.source.getFreeDragPosition().y,
    };
  }

  onDragMoved(event: CdkDragMove, node: any) {
    // optional drag feedback logic
  }

  addNode() {
    const id = this.nodes.length + 1;
    this.nodes.push({ id, position: { x: 200, y: 200 } });
  }

  deleteNode() {
    if (this.nodes.length > 0) {
      this.nodes.pop();
    }
  }
}
