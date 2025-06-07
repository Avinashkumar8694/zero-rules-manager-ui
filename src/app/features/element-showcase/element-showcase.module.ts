import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Monaco Editor
import { MonacoEditorModule, NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor-v2';
import { ElementShowcaseComponent } from './element-showcase.component';

// Widgets - temporarily commented out
// import { WidgetsModule } from '../../widgets/widgets.module';

const monacoConfig = {
  baseUrl: 'assets', // Configure base path for Monaco Editor assets
  defaultOptions: { 
    scrollBeyondLastLine: false,
    minimap: { enabled: false },
    automaticLayout: true,
  }
};

const routes = [
  {
    path: '',
    component: ElementShowcaseComponent
  }
];

@NgModule({
  declarations: [
    ElementShowcaseComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatToolbarModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatChipsModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
      // Other modules
    FontAwesomeModule,
    MonacoEditorModule
    // WidgetsModule - temporarily commented out
  ],
  providers: [
    {
      provide: NGX_MONACO_EDITOR_CONFIG,
      useValue: monacoConfig
    }
  ]
})
export class ElementShowcaseModule { }
