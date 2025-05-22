import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-canvas',
  template: `
    <div class="canvas-container">
      <div class="canvas-controls">
        <button mat-icon-button (click)="zoomIn()">
          <mat-icon>zoom_in</mat-icon>
        </button>
        <button mat-icon-button (click)="zoomOut()">
          <mat-icon>zoom_out</mat-icon>
        </button>
        <button mat-icon-button (click)="resetZoom()">
          <mat-icon>center_focus_strong</mat-icon>
        </button>
      </div>
      
      <div class="canvas-wrapper" #canvasWrapper
           [style.transform]="'scale(' + scale + ')'"
           [style.transform-origin]="'center center'">
        <div class="canvas" cdkDropListGroup>
          <!-- Draggable element -->
          <div class="draggable-element"
               cdkDrag
               [cdkDragBoundary]="'.canvas'"
               (cdkDragStarted)="onDragStarted($event)"
               (cdkDragEnded)="onDragEnded($event)">
            <mat-icon>drag_indicator</mat-icon>
            <span>Drag me</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f5f5f5;
    }

    .canvas-controls {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 100;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      gap: 8px;
      padding: 8px;
    }

    .canvas-wrapper {
      width: 100%;
      height: 100%;
      transition: transform 0.2s;
    }

    .canvas {
      width: 2000px;
      height: 2000px;
      position: relative;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .draggable-element {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4a90e2;
      color: white;
      padding: 16px;
      border-radius: 4px;
      cursor: move;
      display: flex;
      align-items: center;
      gap: 8px;
      user-select: none;
    }

    .draggable-element:active {
      box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                0 8px 10px 1px rgba(0,0,0,0.14),
                0 3px 14px 2px rgba(0,0,0,0.12);
    }
  `],
  standalone: false
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;
  scale = 1;
  private readonly ZOOM_STEP = 0.1;
  private readonly MIN_SCALE = 0.5;
  private readonly MAX_SCALE = 2;

  constructor() {}

  ngAfterViewInit() {
    // Initialize canvas
  }

  zoomIn() {
    if (this.scale < this.MAX_SCALE) {
      this.scale = Math.min(this.scale + this.ZOOM_STEP, this.MAX_SCALE);
    }
  }

  zoomOut() {
    if (this.scale > this.MIN_SCALE) {
      this.scale = Math.max(this.scale - this.ZOOM_STEP, this.MIN_SCALE);
    }
  }

  resetZoom() {
    this.scale = 1;
  }

  onDragStarted(event: any) {
    const element = event.source.element.nativeElement;
    element.style.zIndex = '100';
  }

  onDragEnded(event: any) {
    const element = event.source.element.nativeElement;
    element.style.zIndex = 'auto';
  }
}