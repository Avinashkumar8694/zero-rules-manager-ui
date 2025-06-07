import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NodesModule } from '../../../nodes/nodes.module';

import { FlowVersionCanvasDialogComponent } from './flow-version-canvas-dialog.component';
import { ConditionEditorComponent } from './condition-editor/condition-editor.component';

@NgModule({
  declarations: [
    FlowVersionCanvasDialogComponent,
    ConditionEditorComponent
  ],  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTooltipModule,
    ReactiveFormsModule,
    DragDropModule,
    NodesModule
  ],
  exports: [
    FlowVersionCanvasDialogComponent
  ]
})
export class FlowVersionCanvasDialogModule { }