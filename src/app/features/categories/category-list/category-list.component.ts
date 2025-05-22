import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faLayerGroup, faSearch, faTag, faInfoCircle, faCalendarAlt, faClock, faCog, faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { AddCategoryDialogComponent } from './add-category-dialog/add-category-dialog.component';
import { DeleteCategoryDialogComponent } from './delete-category-dialog/delete-category-dialog.component';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryResponse {
  items: Category[];
  total: number;
  limit: number;
  offset: number;
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  standalone: false,
})
export class CategoryListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'createdAt', 'actions'];
  dataSource: MatTableDataSource<Category>;
  loading = false;
  error: string | null = null;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router,
    library: FaIconLibrary
  ) {
    this.dataSource = new MatTableDataSource<Category>();
    library.addIcons(faLayerGroup, faSearch, faTag, faInfoCircle, faCalendarAlt, faClock, faCog, faEdit, faTrashAlt);
  }

  ngOnInit() {
    this.fetchCategories();
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddCategoryDialog(category?: Category) {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '500px',
      disableClose: true,
      data: category
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchCategories();
      }
    });
  }

  onEditCategory(category: Category) {
    this.openAddCategoryDialog(category);
  }

  onViewVersions(category: Category) {
    this.router.navigate(['/categories', category.id, 'versions']);
  }

  onDeleteCategory(category: Category) {
    const dialogRef = this.dialog.open(DeleteCategoryDialogComponent, {
      width: '400px',
      data: { id: category.id, name: category.name }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        this.http.delete(`http://localhost:3000/api/categories/${category.id}`)
          .subscribe({
            next: () => {
              this.fetchCategories();
            },
            error: (err) => {
              console.error('Error deleting category:', err);
              this.error = 'Failed to delete category';
              this.loading = false;
            }
          });
      }
    });
  }

  private fetchCategories() {
    this.loading = true;
    this.error = null;
    
    this.http.get<CategoryResponse>('http://localhost:3000/api/categories')
      .subscribe({
        next: (data) => {
          this.dataSource.data = data?.items || [];
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load categories';
          this.loading = false;
          console.error('Error fetching categories:', err);
        }
      });
  }
}