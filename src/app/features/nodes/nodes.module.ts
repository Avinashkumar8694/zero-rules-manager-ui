import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { NodesRoutingModule } from './nodes-routing.module';
import { NodesListComponent } from './components/nodes-list/nodes-list.component';
import { AttributeWindowComponent } from './components/attribute-window/attribute-window.component';
import { MatIconModule } from '@angular/material/icon';
import { RegisteredNodesListComponent } from './components/registered-nodes-list/registered-nodes-list.component';
import { NodeListDialogComponent } from './components/node-list-dialog/node-list-dialog.component';

@NgModule({
  declarations: [
    NodesListComponent,
    RegisteredNodesListComponent,
    NodeListDialogComponent,
    AttributeWindowComponent
  ],  imports: [
    CommonModule,
    NodesRoutingModule,
    FormsModule,
    DragDropModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    HttpClientModule
  ],
  exports: [
    AttributeWindowComponent,
    RegisteredNodesListComponent
  ],
  providers: []
})
export class NodesModule { }