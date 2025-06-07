import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faUser, faCog, faFile, faSave } from '@fortawesome/free-solid-svg-icons';

export interface SampleTableData {
  name: string;
  type: string;
  active: boolean;
}

@Component({
  selector: 'app-element-showcase',
  templateUrl: './element-showcase.component.html',
  styleUrls: ['./element-showcase.component.scss'],
  standalone: false
})
export class ElementShowcaseComponent implements OnInit {
  // FontAwesome icons
  userIcon: IconDefinition = faUser;
  cogIcon: IconDefinition = faCog;
  fileIcon: IconDefinition = faFile;
  saveIcon: IconDefinition = faSave;

  // Sample data for table
  sampleData = new MatTableDataSource<SampleTableData>([
    { name: 'Category 1', type: 'excel', active: true },
    { name: 'Category 2', type: 'code', active: false },
    { name: 'Category 3', type: 'flow', active: true },
    { name: 'Version 1', type: 'excel', active: true },
    { name: 'Version 2', type: 'code', active: false }
  ]);

  displayedColumns: string[] = ['name', 'type', 'status', 'actions'];

  // Dropdown options for widgets
  dropdownOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  // Sample code for Monaco editor
  sampleCode = `function processData(input: any[]): any[] {
  return input.map(item => {
    return {
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    };
  });
}

// Example usage
const data = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];

const result = processData(data);
console.log(result);`;

  // Current date for date display
  currentDate = new Date();

  // Form data
  searchText = '';
  formData = {
    username: '',
    description: '',
    category: '',
    active: false
  };
  formResult: any = null;

  // Button states
  isLoading = false;
  isLoadingSecondary = false;
  isLoadingIcon = false;
  isActive = false;

  constructor() { }

  ngOnInit(): void {
    // Initialize any needed data
  }

  // Search functionality
  onSearch() {
    // In a real app, you would filter your data here
    console.log('Searching for:', this.searchText);
  }

  // Form submission
  onSubmit() {
    this.formResult = { ...this.formData };
    console.log('Form submitted:', this.formResult);
  }

  // Reset form
  onReset() {
    this.formData = {
      username: '',
      description: '',
      category: '',
      active: false
    };
    this.formResult = null;
  }

  // Button toggle functions
  toggleLoader() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  toggleSecondaryLoader() {
    this.isLoadingSecondary = true;
    setTimeout(() => {
      this.isLoadingSecondary = false;
    }, 2000);
  }

  toggleIconLoader() {
    this.isLoadingIcon = true;
    setTimeout(() => {
      this.isLoadingIcon = false;
    }, 2000);
  }

  toggleActive() {
    this.isActive = !this.isActive;
  }
}