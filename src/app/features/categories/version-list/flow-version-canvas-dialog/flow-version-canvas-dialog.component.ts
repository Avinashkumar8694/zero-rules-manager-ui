import { Component, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragMove, Point } from '@angular/cdk/drag-drop';

interface NodeAppearance {
  color?: string;
  icon?: string;
  category?: string;
}

interface NodeDefaults {
  [key: string]: any;
}

interface Node {
  type: string;
  service?: string;
  appearance?: NodeAppearance;
  io?: { inputs: number; outputs: number };
  defaults?: NodeDefaults;
  hooks?: any;
  template?: string;
  position?: Point; // x, y position on canvas
}

interface Flow {
  nodes: Map<string, Node>;
  connections: any[];
}

interface FlowVersionCanvasDialogData {
  id: string;
  name: string;
  description: string;
  type: string;
  flowConfig: Flow;
}

@Component({
  selector: 'app-flow-version-canvas-dialog',
  templateUrl: './flow-version-canvas-dialog.component.html',
  styleUrls: ['./flow-version-canvas-dialog.component.scss'],
  standalone: false
})
export class FlowVersionCanvasDialogComponent implements AfterViewInit {
  scale = 1;
  readonly MIN_SCALE = 0.5;
  readonly MAX_SCALE = 2;
  readonly ZOOM_STEP = 0.1;

  nodes: Map<string, Node> = new Map();

  @ViewChild('canvasBoundary', { static: false }) canvasBoundary!: ElementRef<HTMLDivElement>;

  constructor(
    private dialogRef: MatDialogRef<FlowVersionCanvasDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FlowVersionCanvasDialogData
  ) {
    // Ensure nodes map and default position
    if (data.flowConfig?.nodes) {
      this.nodes = new Map(
        Array.from(data.flowConfig.nodes.entries()).map(([key, node]) => {
          if (!node.position) {
            node.position = { x: 0, y: 0 };
          }
          return [key, node];
        })
      );
    }
  }

  ngAfterViewInit() {
    // canvasBoundary element reference available here if needed
  }

  zoomIn(): void {
    this.scale = Math.min(this.scale + this.ZOOM_STEP, this.MAX_SCALE);
  }

  zoomOut(): void {
    this.scale = Math.max(this.scale - this.ZOOM_STEP, this.MIN_SCALE);
  }

  saveCanvas(): void {
    console.log('Saving canvas...');
    // Implement your save logic here
  }

  onClose(): void {
    this.dialogRef.close();
  }

  findNearestPosition(nodeKey: string): Point {
    const GRID_SIZE = 150; // Space between nodes
    const existingPositions = Array.from(this.nodes.entries())
      .filter(([key]) => key !== nodeKey)
      .map(([_, node]) => node.position);

    if (existingPositions.length === 0) {
      return { x: 100, y: 100 }; // Initial position for first node
    }

    // Find available grid position
    let x = 100;
    let y = 100;
    let found = false;

    while (!found) {
      const occupied = existingPositions.some(pos =>
        pos && Math.abs(pos.x - x) < GRID_SIZE && Math.abs(pos.y - y) < GRID_SIZE
      );

      if (!occupied) {
        found = true;
      } else {
        x += GRID_SIZE;
        if (x > 1000) { // Wrap to next row
          x = 100;
          y += GRID_SIZE;
        }
      }
    }

    return { x, y };
  }

  onNodeMoved(event: CdkDragMove<any>, nodeKey: string) {
    const position = event.source.getFreeDragPosition();
    const node = this.nodes.get(nodeKey);
    if (node) {
      node.position = position;
      this.nodes.set(nodeKey, node);
    }
  }
}
