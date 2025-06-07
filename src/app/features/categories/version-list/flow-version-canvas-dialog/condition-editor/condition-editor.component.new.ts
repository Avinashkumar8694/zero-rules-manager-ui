import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

interface ConditionEditorData {
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  name?: string;
  sourceNode: any;
  targetNode: any;
}

interface Rule {
  field: string;
  comparison: string;
  value: string | number | boolean;
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: Rule[];
  nestedGroups?: ConditionGroup[];
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

  availableFields: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<ConditionEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConditionEditorData,
    private fb: FormBuilder
  ) {
    this.initializeAvailableFields();
    
    this.conditionForm = this.fb.group({
      name: [data.name || '', [Validators.maxLength(50)]],
      conditions: this.fb.array([])
    });

    if (data.condition) {
      this.parseExistingCondition(data.condition);
    } else {
      this.addConditionGroup();
    }
  }

  private initializeAvailableFields() {
    if (!this.data?.sourceNode || !this.data?.targetNode) {
      console.warn('Source or target node missing in condition editor');
      return;
    }

    const sourceFields = this.extractNodeFields(this.data.sourceNode);
    const targetFields = this.extractNodeFields(this.data.targetNode);
    this.availableFields = Array.from(new Set([...sourceFields, ...targetFields])).sort();

    if (this.availableFields.length === 0) {
      this.availableFields.push('value', 'type', 'status');
    }
  }

  private extractNodeFields(node: any): string[] {
    if (!node) return [];
    
    const fields: Set<string> = new Set();
    
    if (node.config?.properties) {
      Object.keys(node.config.properties).forEach(key => fields.add(key));
    }

    if (node.attributes) {
      Object.keys(node.attributes).forEach(key => fields.add(key));
    }

    if (typeof node === 'object') {
      ['value', 'type', 'status', 'name', 'description'].forEach(key => {
        if (key in node) fields.add(key);
      });
    }

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

  getRules(group: AbstractControl): FormArray {
    return group.get('rules') as FormArray;
  }

  getRulesControls(group: AbstractControl): AbstractControl[] {
    return this.getRules(group).controls;
  }

  getNestedGroups(group: AbstractControl): FormArray {
    return group.get('nestedGroups') as FormArray;
  }

  getNestedGroupsControls(group: AbstractControl): AbstractControl[] {
    return this.getNestedGroups(group).controls;
  }

  getConditionGroups(): AbstractControl[] {
    return this.conditions.controls;
  }

  private getGroupAtPath(path: number[]): AbstractControl | null {
    if (!path.length) return null;
    
    let currentGroup: AbstractControl | null = this.conditions.at(path[0]);
    if (!currentGroup) return null;
    
    for (let i = 1; i < path.length; i++) {
      const nestedGroups = this.getNestedGroups(currentGroup);
      currentGroup = nestedGroups.at(path[i]);
      if (!currentGroup) return null;
    }
    
    return currentGroup;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.conditions.controls, event.previousIndex, event.currentIndex);
    }
  }

  dropRule(event: CdkDragDrop<any[]>, groupIndex: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(groupIndex) : 
      this.getGroupAtPath([groupIndex, ...path]);
    
    if (!group) return;
    
    const rules = this.getRules(group);
    if (event.previousContainer === event.container) {
      moveItemInArray(rules.controls, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        rules.controls,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  dropNestedGroup(event: CdkDragDrop<any[]>, groupIndex: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(groupIndex) : 
      this.getGroupAtPath([groupIndex, ...path]);
    
    if (!group) return;
    
    const nestedGroups = this.getNestedGroups(group);
    if (event.previousContainer === event.container) {
      moveItemInArray(nestedGroups.controls, event.previousIndex, event.currentIndex);
    }
  }

  createConditionGroup() {
    return this.fb.group({
      operator: ['AND', Validators.required],
      rules: this.fb.array([]),
      nestedGroups: this.fb.array([])
    });
  }

  addNestedGroup(index: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(index) : 
      this.getGroupAtPath([index, ...path]);
    
    if (!group) return;
    
    const nestedGroup = this.createConditionGroup();
    this.getNestedGroups(group).push(nestedGroup);
    
    // Add a default rule to the new nested group
    const rule = this.createRule();
    this.getRules(nestedGroup).push(rule);
    
    return nestedGroup;
  }

  createRule() {
    return this.fb.group({
      field: ['', Validators.required],
      comparison: ['equals', Validators.required],
      value: ['', this.conditionValueValidator()]
    });
  }

  addConditionGroup() {
    const group = this.createConditionGroup();
    const rules = this.getRules(group);
    const rule = this.createRule();
    rules.push(rule);
    this.conditions.push(group);
  }

  addRule(groupIndex: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(groupIndex) : 
      this.getGroupAtPath([groupIndex, ...path]);
    if (!group) return;
    
    const rules = this.getRules(group);
    const rule = this.createRule();
    
    // Update value validator when comparison changes
    rule.get('comparison')?.valueChanges.subscribe(() => {
      rule.get('value')?.updateValueAndValidity();
    });

    rules.push(rule);
  }

  removeGroup(groupIndex: number, path: number[] = []) {
    if (path.length === 0) {
      if (this.conditions.length > 1) {
        this.conditions.removeAt(groupIndex);
      }
      return;
    }

    const parentPath = path.slice(0, -1);
    const lastIndex = path[path.length - 1];
    
    const parentGroup = this.getGroupAtPath([groupIndex, ...parentPath]);
    if (!parentGroup) return;
    
    const nestedGroups = this.getNestedGroups(parentGroup);
    if (nestedGroups.length > 1) {
      nestedGroups.removeAt(lastIndex);
    }
  }

  removeRule(groupIndex: number, ruleIndex: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(groupIndex) : 
      this.getGroupAtPath([groupIndex, ...path]);
    if (!group) return;
    
    const rules = this.getRules(group);
    if (rules.length > 1) {
      rules.removeAt(ruleIndex);
    }
  }

  private conditionValueValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const condition = control.parent;
      if (!condition) return null;

      const comparison = condition.get('comparison')?.value;
      if (!comparison || ['is_empty', 'is_not_empty'].includes(comparison)) {
        return null;
      }

      if (!control.value && control.value !== 0) {
        return { required: true };
      }

      return null;
    };
  }

  shouldShowValue(comparison: string): boolean {
    return !['is_empty', 'is_not_empty'].includes(comparison);
  }

  getFieldType(fieldName: string): 'text' | 'number' | 'boolean' {
    if (!fieldName) return 'text';
    
    if (fieldName.includes('count') || fieldName.includes('amount') || fieldName.includes('number')) {
      return 'number';
    }
    if (fieldName.includes('is') || fieldName.includes('has') || fieldName.includes('enabled')) {
      return 'boolean';
    }
    return 'text';
  }

  private buildConditionString(group: ConditionGroup): string {
    const parts: string[] = [];
    
    // Add rules
    for (const rule of group.rules) {
      if (['is_empty', 'is_not_empty'].includes(rule.comparison)) {
        parts.push(`${rule.field} ${rule.comparison}`);
      } else {
        parts.push(`${rule.field} ${rule.comparison} ${rule.value}`);
      }
    }

    // Add nested groups
    if (group.nestedGroups?.length) {
      for (const nestedGroup of group.nestedGroups) {
        const nestedStr = this.buildConditionString(nestedGroup);
        if (nestedStr) {
          parts.push(`(${nestedStr})`);
        }
      }
    }

    return parts.join(` ${group.operator} `);
  }

  save() {
    if (this.conditionForm.valid) {
      const conditions = this.conditions.getRawValue() as ConditionGroup[];
      const conditionString = conditions.map(group => this.buildConditionString(group))
        .filter(str => str)
        .join(' AND ');
        
      this.dialogRef.close({
        name: this.conditionForm.get('name')?.value,
        condition: conditionString
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  private parseExistingCondition(condition: string) {
    try {
      const groups = this.parseConditionGroups(condition);
      
      groups.forEach(group => {
        const groupForm = this.createConditionGroup();
        const rulesArray = this.getRules(groupForm);
        
        group.rules.forEach(rule => {
          const ruleForm = this.fb.group({
            field: [rule.field, Validators.required],
            comparison: [rule.comparison, Validators.required],
            value: [rule.value, this.conditionValueValidator()]
          });
          rulesArray.push(ruleForm);
        });

        if (group.nestedGroups?.length) {
          const nestedGroupsArray = this.getNestedGroups(groupForm);
          group.nestedGroups.forEach(nestedGroup => {
            const nestedGroupForm = this.createConditionGroup();
            // Recursively add nested rules
            nestedGroup.rules.forEach(rule => {
              const ruleForm = this.fb.group({
                field: [rule.field, Validators.required],
                comparison: [rule.comparison, Validators.required],
                value: [rule.value, this.conditionValueValidator()]
              });
              this.getRules(nestedGroupForm).push(ruleForm);
            });
            nestedGroupsArray.push(nestedGroupForm);
          });
        }

        this.conditions.push(groupForm);
      });

      if (this.conditions.length === 0) {
        this.addConditionGroup();
      }
    } catch (error) {
      console.error('Error parsing condition:', error);
      this.addConditionGroup();
    }
  }

  private parseConditionGroups(condition: string): ConditionGroup[] {
    // This is a simplified parser. In a real application, you'd want a more robust parser
    // that can handle nested parentheses and complex conditions.
    const groups: ConditionGroup[] = [];
    const parts = condition.split(' AND ');
    
    parts.forEach(part => {
      const group: ConditionGroup = {
        operator: 'AND',
        rules: [],
        nestedGroups: []
      };

      if (part.includes('(')) {
        // Handle nested conditions
        const nestedParts = part.match(/\((.*?)\)/g) || [];
        nestedParts.forEach(nestedPart => {
          const nestedCondition = nestedPart.slice(1, -1).trim();
          const nestedGroups = this.parseConditionGroups(nestedCondition);
          group.nestedGroups?.push(...nestedGroups);
        });
      }

      // Extract simple conditions
      const conditions = part.replace(/\(.*?\)/g, '').trim().split(/ (?:AND|OR) /);
      conditions.forEach(condition => {
        if (!condition) return;
        
        const matches = condition.match(/^(\w+)\s+(\w+(?:_\w+)*)\s*(.*)$/);
        if (matches) {
          const [, field, comparison, value] = matches;
          group.rules.push({ field, comparison, value: value.trim() });
        }
      });

      if (group.rules.length || group.nestedGroups?.length) {
        groups.push(group);
      }
    });

    return groups;
  }
}
