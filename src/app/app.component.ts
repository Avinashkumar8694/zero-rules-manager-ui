import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  sidenavExpanded = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.fetchCategories();
    this.router.navigate(['/rules']);
  }

  private fetchCategories() {
    this.loading = true;
    this.error = null;
    
    this.http.get<Category[]>('http://localhost:3000/api/categories')
      .subscribe({
        next: (data) => {
          this.categories = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load categories';
          this.loading = false;
          console.error('Error fetching categories:', err);
        }
      });
  }

  toggleSidenav() {
    this.sidenavExpanded = !this.sidenavExpanded;
  }
}
