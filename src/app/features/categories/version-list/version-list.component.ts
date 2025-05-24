import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DeleteVersionDialogComponent } from './delete-version-dialog/delete-version-dialog.component';
import { VersionTypeDialogComponent } from './version-type-dialog/version-type-dialog.component';
import { AddVersionDialogComponent } from './add-version-dialog/add-version-dialog.component';
import { ExcelVersionDialogComponent } from './excel-version-dialog/excel-version-dialog.component';
import { CodeVersionDialogComponent } from './code-version-dialog/code-version-dialog.component';
import { FlowVersionDialogComponent } from './flow-version-dialog/flow-version-dialog.component';
import { FlowVersionCanvasDialogComponent } from './flow-version-canvas-dialog/flow-version-canvas-dialog.component';

interface Version {
  id: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-version-list',
  templateUrl: './version-list.component.html',
  styleUrls: ['./version-list.component.scss'],
  standalone: false
})
export class VersionListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'type', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Version>();
  categoryId: string;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dialog: MatDialog
  ) {
    this.categoryId = this.route.snapshot.params['categoryId'];
    this.dataSource = new MatTableDataSource<Version>();
  }

  ngOnInit() {
    this.loadVersions();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  loadVersions() {
    this.http.get<{ items: Version[] }>(`${environment.apiBaseUrl}/categories/${this.categoryId}/versions`)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.items;
        },
        error: (error) => {
          console.error('Error loading versions:', error);
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAddVersion() {
    const dialogRef = this.dialog.open(VersionTypeDialogComponent, {
      width: 'auto',
      minWidth: '50rem',
      disableClose: true,
      data: { categoryId: this.categoryId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadVersions();
      }
    });
  }

  onEditVersion(version: Version) {
    let dialogRef;
    
    if (version.type === 'excel') {
      dialogRef = this.dialog.open(ExcelVersionDialogComponent, {
        width: '500px',
        disableClose: true,
        data: { categoryId: this.categoryId, version }
      });
    } else if (version.type === 'code') {
      dialogRef = this.dialog.open(CodeVersionDialogComponent, {
        width: 'auto',
        minWidth: '50rem',
        minHeight: '30rem',
        maxHeight: '91vh',
        disableClose: true,
        data: { categoryId: this.categoryId, version }
      });
    } else if(version.type === 'flow') {
      dialogRef = this.dialog.open(FlowVersionCanvasDialogComponent, {
        width: '100vw',
        height: '100vh',
        // minWidth:'100vw',
        // maxWidth: '100vw',
        // maxHeight: '100vh',
        position: { right: '0' },
        panelClass: 'fullscreen-dialog',
        disableClose: true,
        data: version
      });
    }

    if (dialogRef) {
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadVersions();
        }
      });
    }
  }

  onToggleVersionStatus(version: Version) {
    const newStatus = !version.isActive;
    this.http.patch(`${environment.apiBaseUrl}/versions/${version.id}`, {
      isActive: newStatus
    }).subscribe({
      next: () => {
        this.loadVersions();
      },
      error: (error) => {
        console.error('Error toggling version status:', error);
      }
    });
  }

  onDeleteVersion(version: Version) {
    const dialogRef = this.dialog.open(DeleteVersionDialogComponent, {
      width: '400px',
      data: { id: version.id, name: version.name }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.http.delete(`${environment.apiBaseUrl}/versions/${version.id}`)
          .subscribe({
            next: () => {
              this.loadVersions();
            },
            error: (error) => {
              console.error('Error deleting version:', error);
            }
          });
      }
    });
  }
}