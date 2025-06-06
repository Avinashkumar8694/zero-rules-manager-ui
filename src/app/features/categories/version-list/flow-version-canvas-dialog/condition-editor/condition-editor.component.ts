import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface ConditionEditorData {
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  name?: string;
  sourceNode: any;
  targetNode: any;
}

interface Condition {
  field: string;
  comparison: string;
  value: string | number | boolean;
}

@Component({
  selector: 'app-condition-editor',
  templateUrl: './condition-editor.component.html',
  styleUrls: ['./condition-editor.component.scss'],
  standalone: false
})
export class ConditionEditorComponent {
  conditionForm: FormGroup;
  operators = ['AND', 'OR'];
  comparisons = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equals', label: 'Greater Than or Equal' },
    { value: 'less_equals', label: 'Less Than or Equal' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  // Available fields from source and target nodes
  availableFields: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<ConditionEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConditionEditorData,
    private fb: FormBuilder
  ) {
    this.initializeAvailableFields();
    
    this.conditionForm = this.fb.group({
      name: [data.name || '', [Validators.maxLength(50)]],
      operator: ['AND', Validators.required],
      conditions: this.fb.array([], [Validators.required, Validators.minLength(1)])
    });

    // Add default condition if none exist
    if (this.conditions.length === 0) {
      this.addCondition();
    }

    // Parse existing condition if it exists
    if (data.condition) {
      this.parseExistingCondition(data.condition);
    }
  }

  private initializeAvailableFields() {
    if (!this.data?.sourceNode || !this.data?.targetNode) {
      console.warn('Source or target node missing in condition editor');
      return;
    }

    // Extract fields from source and target nodes
    const sourceFields = this.extractNodeFields(this.data.sourceNode);
    const targetFields = this.extractNodeFields(this.data.targetNode);
    
    // Combine and deduplicate fields
    this.availableFields = Array.from(new Set([...sourceFields, ...targetFields])).sort();

    // If no fields were found, add some default ones
    if (this.availableFields.length === 0) {
      this.availableFields.push('value', 'type', 'status');
    }
  }

  private extractNodeFields(node: any): string[] {
    if (!node) return [];
    
    const fields: Set<string> = new Set();
    
    // Add fields from node config properties if they exist
    if (node.config?.properties) {
      Object.keys(node.config.properties).forEach(key => fields.add(key));
    }

    // Add fields from node attributes if they exist
    if (node.attributes) {
      Object.keys(node.attributes).forEach(key => fields.add(key));
    }

    // Add any direct properties of the node that might be relevant
    if (typeof node === 'object') {
      ['value', 'type', 'status', 'name', 'description'].forEach(key => {
        if (key in node) fields.add(key);
      });
    }

    // Add additional fields based on node type
    if (node.type) {
      switch (node.type.toLowerCase()) {
        case 'data':
        case 'input':
          fields.add('value');
          fields.add('type');
          break;
        case 'condition':
        case 'decision':
          fields.add('condition');
          fields.add('status');
          break;
        case 'transform':
          fields.add('input');
          fields.add('output');
          break;
      }
    }

    return Array.from(fields);
  }

  get conditions() {
    return this.conditionForm.get('conditions') as FormArray;
  }

  addCondition() {
    const condition = this.fb.group({
      field: ['', [Validators.required]],
      comparison: ['equals', [Validators.required]],
      value: ['', this.conditionValueValidator()]
    });

    // Update value validator when comparison changes
    condition.get('comparison')?.valueChanges.subscribe(() => {
      condition.get('value')?.updateValueAndValidity();
    });

    this.conditions.push(condition);
  }

  removeCondition(index: number) {
    if (this.conditions.length > 1) {
      this.conditions.removeAt(index);
    }
  }

  private conditionValueValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const condition = control.parent;
      if (!condition) return null;

      const comparison = condition.get('comparison')?.value;
      if (!comparison) return null;

      // Skip validation for conditions that don't need a value
      if (['is_empty', 'is_not_empty'].includes(comparison)) {
        return null;
      }

      if (!control.value && control.value !== 0) {
        return { required: true };
      }

      return null;
    };
  }

  private parseExistingCondition(condition: string) {
    try {
      // Split by AND/OR operator
      const operator = condition.includes(' AND ') ? 'AND' : 'OR';
      const parts = condition.split(` ${operator} `);

      // Set the operator
      this.conditionForm.get('operator')?.setValue(operator);

      // Clear existing conditions
      while (this.conditions.length > 0) {
        this.conditions.removeAt(0);
      }

      // Parse each condition part
      parts.forEach(part => {
        const matches = part.match(/^(\w+)\s+(\w+(?:_\w+)*)\s+(.+)$/);
        if (matches) {
          const [, field, comparison, value] = matches;
          const condition = this.fb.group({
            field: [field, Validators.required],
            comparison: [comparison, Validators.required],
            value: [value, this.conditionValueValidator()]
          });
          this.conditions.push(condition);
        }
      });

      // If no valid conditions were parsed, add a default one
      if (this.conditions.length === 0) {
        this.addCondition();
      }
    } catch (error) {
      console.error('Error parsing condition:', error);
      this.addCondition(); // Add default condition on parse error
    }
  }

  private buildConditionString(): string {
    if (this.conditions.length === 0) return '';

    const parts = this.conditions.getRawValue().map((c: Condition) => {
      // Skip value for special comparisons
      if (['is_empty', 'is_not_empty'].includes(c.comparison)) {
        return `${c.field} ${c.comparison}`;
      }
      return `${c.field} ${c.comparison} ${c.value}`;
    });

    return parts.join(` ${this.conditionForm.get('operator')?.value} `);
  }

  save() {
    if (this.conditionForm.valid) {
      this.dialogRef.close({
        name: this.conditionForm.get('name')?.value,
        condition: this.buildConditionString()
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  shouldShowValue(comparison: string): boolean {
    return !['is_empty', 'is_not_empty'].includes(comparison);
  }

  getFieldType(fieldName: string): 'text' | 'number' | 'boolean' {
    // Implement logic to determine field type based on field name or node configuration
    if (fieldName.includes('count') || fieldName.includes('amount') || fieldName.includes('number')) {
      return 'number';
    }
    if (fieldName.includes('is') || fieldName.includes('has') || fieldName.includes('enabled')) {
      return 'boolean';
    }
    return 'text';
  }
}
