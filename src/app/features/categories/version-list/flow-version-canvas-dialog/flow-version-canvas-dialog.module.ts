import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NodesModule } from '../../../nodes/nodes.module';

import { FlowVersionCanvasDialogComponent } from './flow-version-canvas-dialog.component';
import { AttributeWindowComponent } from './attribute-window/attribute-window.component';

@NgModule({
  declarations: [
    FlowVersionCanvasDialogComponent,
    AttributeWindowComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    NodesModule
  ],
  exports: [
    FlowVersionCanvasDialogComponent
  ]
})
export class FlowVersionCanvasDialogModule { }