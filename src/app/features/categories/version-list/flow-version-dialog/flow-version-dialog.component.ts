import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface FlowVersionDialogData {
  categoryId: string;
}

@Component({
  selector: 'app-flow-version-dialog',
  template: `
    <div class="dialog-container paper-theme">
      <div class="dialog-header">
        <h2>Create Flow Version</h2>
      </div>
      <form [formGroup]="flowVersionForm" (ngSubmit)="onSubmit()">
        <div class="dialog-content">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" required>
            <mat-error *ngIf="flowVersionForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" required rows="4"></textarea>
            <mat-error *ngIf="flowVersionForm.get('description')?.hasError('required')">
              Description is required
            </mat-error>
          </mat-form-field>
        </div>
        <div class="dialog-actions">          <button mat-button type="button" (click)="onCancel()" class="secondary">Cancel</button>
          <button mat-button type="submit" [disabled]="flowVersionForm.invalid || loading" class="primary">
            <span *ngIf="!loading">Create</span>
            <mat-spinner diameter="20" color="primary" *ngIf="loading"></mat-spinner>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`    .dialog-container {
      /* Use global dialog styles for proper flexbox layout and sticky footer */
      min-width: 500px;
    }.dialog-header {
      /* Enhanced header styling applied globally via styles.scss */
    }

    .dialog-header h2 {
      margin: 0;
    }    .dialog-content {
      /* Content styling handled by global styles.scss */
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }    .dialog-actions {
      /* Sticky footer styling handled by global styles.scss */
    }

    mat-spinner {
      margin: 0 8px;
    }
  `],
  standalone: false
})
export class FlowVersionDialogComponent {
  flowVersionForm: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<FlowVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FlowVersionDialogData,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.flowVersionForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.flowVersionForm.valid) {
      this.loading = true;
      const payload = {
        ...this.flowVersionForm.value,
        type: 'flow',
        inputColumns: {},
        outputColumns: {},
        flow: {
          nodes: [],
          connections: []
        }
      };

      this.http.post(
        `${environment.apiBaseUrl}/categories/${this.data.categoryId}/versions/flow`,
        payload
      ).subscribe({
        next: (response) => {
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error creating flow version:', error);
          this.loading = false;
        }
      });
    }
  }
}