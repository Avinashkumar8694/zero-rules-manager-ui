import { Component, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

interface CodeVersionDialogData {
  categoryId: string;
}

@Component({
  selector: 'app-code-version-dialog',
  templateUrl: './code-version-dialog.component.html',
  styleUrls: ['./code-version-dialog.component.scss'],
  standalone: false
})
export class CodeVersionDialogComponent {
  codeVersionForm: FormGroup;
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<CodeVersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CodeVersionDialogData,
    private fb: FormBuilder,
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    this.codeVersionForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      code: ['', Validators.required],
      inputColumns: this.fb.array([]),
      outputColumns: this.fb.array([])
    });
  }

  get inputColumns() {
    return this.codeVersionForm.get('inputColumns') as FormArray;
  }

  get outputColumns() {
    return this.codeVersionForm.get('outputColumns') as FormArray;
  }

  addInputColumn() {
    const column = this.fb.group({
      name: ['', Validators.required],
      type: ['string', Validators.required]
    });
    this.inputColumns.push(column);
  }

  removeInputColumn(index: number) {
    this.inputColumns.removeAt(index);
  }

  addOutputColumn() {
    const column = this.fb.group({
      name: ['', Validators.required],
      type: ['string', Validators.required]
    });
    this.outputColumns.push(column);
  }

  removeOutputColumn(index: number) {
    this.outputColumns.removeAt(index);
  }

  onCodeChange(value: string | undefined) {
    if (value !== undefined) {
      this.ngZone.run(() => {
        this.codeVersionForm.patchValue({ code: value });
      });
    }
  }

  onSubmit() {
    if (this.codeVersionForm.valid) {
      this.loading = true;
      const formData = {
        ...this.codeVersionForm.value,
        type: 'code',
        categoryId: this.data.categoryId
      };

      this.http.post(`http://localhost:3000/api/versions`, formData)
        .subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Error creating code version:', error);
            this.loading = false;
          }
        });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}