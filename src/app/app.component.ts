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
    this.router.navigate(['/categories']);
  }

  toggleSidenav() {
    this.sidenavExpanded = !this.sidenavExpanded;
  }
}
