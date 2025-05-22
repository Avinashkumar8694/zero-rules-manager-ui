import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { NodeRegistrationService } from '../../services/node-registration.service';
import { NodesRoutingModule } from './nodes-routing.module';
import { NodesListComponent } from './components/nodes-list/nodes-list.component';
import { AttributeWindowComponent } from './components/attribute-window/attribute-window.component';

@NgModule({
  declarations: [NodesListComponent, AttributeWindowComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    NodesRoutingModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [NodeRegistrationService]
})
export class NodesModule { }