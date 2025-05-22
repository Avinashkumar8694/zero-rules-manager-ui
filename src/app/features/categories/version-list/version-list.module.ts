import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CanvasModule } from './flow-version-dialog/canvas/canvas.module';

import { VersionListComponent } from './version-list.component';
import { VersionTypeDialogComponent } from './version-type-dialog/version-type-dialog.component';
import { ExcelVersionDialogComponent } from './excel-version-dialog/excel-version-dialog.component';
import { CodeVersionDialogComponent } from './code-version-dialog/code-version-dialog.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AddVersionDialogComponent } from './add-version-dialog/add-version-dialog.component';
import { FlowVersionDialogComponent } from './flow-version-dialog/flow-version-dialog.component';
import { CanvasComponent } from './flow-version-dialog/canvas/canvas.component';

const routes: Routes = [
  { path: '', component: VersionListComponent }
];

@NgModule({
  declarations: [
    VersionListComponent,
    VersionTypeDialogComponent,
    ExcelVersionDialogComponent,
    CodeVersionDialogComponent,
    AddVersionDialogComponent,
    FlowVersionDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    MonacoEditorModule.forRoot(),
    CanvasModule
  ]
})
export class VersionListModule { }