import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface ConditionEditorData {
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  name?: string;
  sourceNode: any;
  targetNode: any;
}

interface Rule {
  field: string;      // Now supports $.flow.variable_name format
  comparison: string;
  value: string | number | boolean;
  isFlowVariable?: boolean; // Flag to indicate if the field is a flow variable
  valueType?: 'any' | 'string' | 'number' | 'boolean' | 'array' | 'flowvariable'; // Type of the value for validation
}

interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: Rule[];
  nestedGroups?: ConditionGroup[];
  level?: number; // Track nesting level for visual hierarchy
}

@Component({
  selector: 'app-condition-editor',
  templateUrl: './condition-editor.component.html',
  styleUrls: ['./condition-editor.component.scss'],
  standalone: false
})
export class ConditionEditorComponent implements OnInit {
  conditionForm!: FormGroup;
  fieldSearchControl = new FormControl('');
  filteredFields!: Observable<string[]>;
  availableFields: string[] = [];
  operators = ['AND', 'OR'];

  constructor(
    private dialogRef: MatDialogRef<ConditionEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConditionEditorData,
    private fb: FormBuilder
  ) {
    this.initializeForm();
    this.initializeFlowVariables();
  }
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
    { value: 'is_not_empty', label: 'Is Not Empty' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' }
  ];

  // Add new properties for flow variables
  flowVariables: string[] = [];
  readonly FLOW_VARIABLE_PREFIX = '$.flow.';

  ngOnInit() {
    this.initializeFieldSearch();
  }

  private initializeForm() {
    this.initializeAvailableFields();
    
    this.conditionForm = this.fb.group({
      name: [this.data.name || '', [Validators.maxLength(50)]],
      conditions: this.fb.array([])
    });

    if (this.data.condition) {
      this.parseExistingCondition(this.data.condition);
    } else {
      const group = this.createConditionGroup();
      const rule = this.createRule();
      this.getRules(group).push(rule);
      this.conditions.push(group);
    }

    // Ensure initial validation
    setTimeout(() => {
      this.validateConditionForm();
    });
  }

  private initializeFlowVariables() {
    // Initialize with some common flow variables
    // These can be fetched from a service in a real application
    this.flowVariables = [
      '$.flow.input',
      '$.flow.output',
      '$.flow.status',
      '$.flow.error'
    ];
  }

  private initializeFieldSearch() {
    this.filteredFields = this.fieldSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterFields(value || ''))
    );
  }

  private _filterFields(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.availableFields.filter(field => 
      this.getFlattenedFieldName(field).toLowerCase().includes(filterValue)
    );
  }

  getFlattenedFieldName(field: string): string {
    if (!field) return '';
    // Convert camelCase/snake_case to readable format with proper nesting
    return field
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\./g, ' → ') // Replace dots with arrows for nested properties
      .replace(/\b\w/g, c => c.toUpperCase()) // Capitalize first letter of each word
      .trim();
  }

  private initializeAvailableFields() {
    const sourceFields = this.extractNodeFields(this.data.sourceNode);
    const targetFields = this.extractNodeFields(this.data.targetNode);
    // Add flow variables to available fields
    this.availableFields = [
      ...this.flowVariables,
      ...new Set([...sourceFields, ...targetFields])
    ].sort();
  }

  private extractNodeFields(node: any): string[] {
    const fields = new Set<string>();

    if (node && typeof node === 'object') {
      // Extract top-level fields
      Object.keys(node).forEach(key => {
        fields.add(key);
        // Add nested fields if value is an object
        if (node[key] && typeof node[key] === 'object') {
          Object.keys(node[key]).forEach(nestedKey => {
            fields.add(`${key}.${nestedKey}`);
          });
        }
      });

      // Add common fields based on node type
      switch(node.type?.toLowerCase()) {
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

  get conditions(): FormArray {
    return this.conditionForm.get('conditions') as FormArray;
  }

  getRules(group: AbstractControl): FormArray {
    return group.get('rules') as FormArray;
  }

  getRulesControls(group: AbstractControl): AbstractControl[] {
    return this.getRules(group).controls;
  }  getNestedGroups(group: AbstractControl): FormArray {
    if (!(group instanceof FormGroup)) {
      console.warn('Expected FormGroup for nested groups');
      return this.fb.array([]);
    }

    const nestedGroups = group.get('nestedGroups');
    if (!nestedGroups) {
      // Initialize nestedGroups if it doesn't exist
      const newArray = this.fb.array([]);
      group.addControl('nestedGroups', newArray);
      return newArray;
    }
    
    return nestedGroups as FormArray;
  }

  getNestedGroupsControls(group: AbstractControl): AbstractControl[] {
    return this.getNestedGroups(group).controls;
  }

  getConditionGroups(): AbstractControl[] {
    return this.conditions.controls;
  }
  // This method is no longer needed as we're using inline context objects in the template

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
  createConditionGroup(operator: 'AND' | 'OR' = 'AND'): FormGroup {
    return this.fb.group({
      operator: [operator, Validators.required],
      rules: this.fb.array([], Validators.minLength(1)),
      nestedGroups: this.fb.array([])
    });
  }

  createRule(): FormGroup {
    return this.fb.group({
      field: ['', [Validators.required, this.flowVariableValidator()]],
      comparison: ['equals', Validators.required],
      value: ['', this.conditionValueValidator()],
      isFlowVariable: [false],
      valueType: ['string']
    });
  }

  addConditionGroup() {
    const group = this.createConditionGroup();
    this.conditions.push(group);
    
    // Add a default rule to the new group
    const rule = this.createRule();
    this.getRules(group).push(rule);
  }  addNestedGroup(parentIndex: number, path: number[] = []) {
    let parentGroup = path.length === 0 ? 
      this.conditions.at(parentIndex) : 
      this.getGroupAtPath([parentIndex, ...path]);
      
    if (!parentGroup) {
      console.warn('Parent group not found');
      return;
    }
    
    const nestedGroups = this.getNestedGroups(parentGroup);
    nestedGroups.push(this.createConditionGroup());
    
    // Force validation after changes
    setTimeout(() => this.validateConditionForm());
  }

  removeNestedGroup(parentIndex: number, index: number, path: number[] = []) {
    let parentGroup = path.length === 0 ? 
      this.conditions.at(parentIndex) : 
      this.getGroupAtPath([parentIndex, ...path]);
      
    if (!parentGroup) {
      console.warn('Parent group not found');
      return;
    }
    
    const nestedGroups = this.getNestedGroups(parentGroup);
    if (nestedGroups.length > index) {
      nestedGroups.removeAt(index);
      
      // Force validation after changes
      setTimeout(() => this.validateConditionForm());
    }
  }

  removeGroup(groupIndex: number, path: number[] = []) {
    if (path.length === 0) {
      if (this.conditions.length > 1) {
        this.conditions.removeAt(groupIndex);
        setTimeout(() => this.validateConditionForm());
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
      setTimeout(() => this.validateConditionForm());
    }
  }

  addRule(groupIndex: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(groupIndex) : 
      this.getGroupAtPath([groupIndex, ...path]);
    
    if (!group) return;
    
    const rules = this.getRules(group);
    const rule = this.createRule();
    
    // Subscribe to field changes to handle custom field
    rule.get('field')?.valueChanges.subscribe(value => {
      if (value === 'custom') {
        const customField = prompt('Enter custom field name:', '');
        if (customField) {
          rule.get('field')?.setValue(customField, { emitEvent: false });
          // Add to available fields if not exists
          if (!this.availableFields.includes(customField)) {
            this.availableFields.push(customField);
            this.initializeFieldSearch(); // Refresh filtered fields
          }
        }
      }
    });

    // Update value validator when comparison changes
    rule.get('comparison')?.valueChanges.subscribe(() => {
      rule.get('value')?.updateValueAndValidity();
    });

    rules.push(rule);
  }

  removeRule(groupIndex: number, ruleIndex: number, path: number[] = []) {
    let group = path.length === 0 ? 
      this.conditions.at(groupIndex) : 
      this.getGroupAtPath([groupIndex, ...path]);
    
    if (!group) return;
    
    const rules = this.getRules(group);
    if (rules.length > 1) {
      rules.removeAt(ruleIndex);
      setTimeout(() => this.validateConditionForm());
    }
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
    } else {
      transferArrayItem(
        event.previousContainer.data,
        nestedGroups.controls,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  // Add validator for flow variables
  private flowVariableValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return { required: true };
      
      if (!value.startsWith(this.FLOW_VARIABLE_PREFIX)) {
        return { invalidFlowVariable: true };
      }
      
      const varName = value.substring(this.FLOW_VARIABLE_PREFIX.length);
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
        return { invalidFlowVariable: true };
      }
      
      return null;
    };
  }

  // Update value validator to handle flow variables
  private conditionValueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parentGroup = control.parent;
      if (!parentGroup) return null;

      const comparison = parentGroup.get('comparison')?.value;
      const field = parentGroup.get('field')?.value;
      const value = control.value;

      // Skip validation for empty/null values in comparisons that don't require values
      if (['is_empty', 'is_not_empty'].includes(comparison)) {
        return null;
      }

      // Handle flow variables in value
      if (typeof value === 'string' && value.startsWith(this.FLOW_VARIABLE_PREFIX)) {
        const varName = value.substring(this.FLOW_VARIABLE_PREFIX.length);
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          return { invalidFlowVariable: true };
        }
        return null;
      }

      // Validate array values for 'in' and 'not_in' comparisons
      if (['in', 'not_in'].includes(comparison)) {
        try {
          const arr = JSON.parse(value);
          if (!Array.isArray(arr)) {
            return { invalidArray: true };
          }
        } catch {
          return { invalidArray: true };
        }
      }

      return null;
    };
  }

  // Helper method to check if a field is a flow variable
  isFlowVariable(field: string): boolean {
    return field?.startsWith(this.FLOW_VARIABLE_PREFIX) || false;
  }

  // Helper method to get the display name for a field
  getFieldDisplayName(field: string): string {
    if (this.isFlowVariable(field)) {
      return field; // Show flow variables as is
    }
    return this.getFlattenedFieldName(field);
  }

  // Update method for value type detection
  updateValueType(rule: AbstractControl, manual: boolean = false) {
    const field = rule.get('field')?.value;
    const isFlowVar = this.isFlowVariable(field);
    let valueType = rule.get('valueType')?.value;
    if (!manual) {
      valueType = this.detectValueType(field);
    }
    rule.patchValue({
      isFlowVariable: isFlowVar,
      valueType: valueType
    }, { emitEvent: false });
  }

  private detectValueType(field: string): 'any' | 'string' | 'number' | 'boolean' | 'array' | 'flowvariable' {
    if (!field) return 'any';
    if (field.startsWith(this.FLOW_VARIABLE_PREFIX)) return 'flowvariable';
    if (field.includes('count') || field.includes('amount')) return 'number';
    if (field.includes('is') || field.includes('has')) return 'boolean';
    if (field.includes('list') || field.includes('array')) return 'array';
    return 'string';
  }

  private isValidFlowVariableName(name: string): boolean {
    // Must start with a letter or underscore, and contain only letters, numbers, and underscores
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  }

  private isRuleValueValid(rule: Rule): boolean {
    // For flowvariable type, value must be a valid flow variable name
    if (rule.valueType === 'flowvariable') {
      if (typeof rule.value !== 'string') return false;
      const val = rule.value.startsWith(this.FLOW_VARIABLE_PREFIX)
        ? rule.value.substring(this.FLOW_VARIABLE_PREFIX.length)
        : rule.value;
      return this.isValidFlowVariableName(val);
    }
    // For any type, value must not be empty/null/undefined
    if (rule.value === undefined || rule.value === null || rule.value === '') return false;
    return true;
  }

  private areAllRulesValid(groups: ConditionGroup[]): boolean {
    for (const group of groups) {
      for (const rule of group.rules) {
        if (!this.isRuleValueValid(rule)) return false;
      }
      if (group.nestedGroups && group.nestedGroups.length) {
        if (!this.areAllRulesValid(group.nestedGroups)) return false;
      }
    }
    return true;
  }

  save() {
    if (!this.conditionForm.valid) {
      this.markFormGroupTouched(this.conditionForm);
      return;
    }
    const conditions = this.conditions.getRawValue() as ConditionGroup[];
    if (!this.areAllRulesValid(conditions)) {
      alert('Please provide valid values for all rules. Flow variable names must start with a letter or underscore and contain only letters, numbers, and underscores.');
      return;
    }
    const conditionString = conditions
      .map(group => this.buildConditionString(group))
      .filter(str => str)
      .join(' AND ');
      
    console.log('Final condition string:', conditionString);
    // this.dialogRef.close({
    //   name: this.conditionForm.get('name')?.value,
    //   condition: conditionString
    // });
  }

  cancel() {
    this.dialogRef.close();
  }

  private parseConditionGroups(condition: string): ConditionGroup[] {
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
  
  private parseExistingCondition(condition: string) {
    try {
      const groups = this.parseConditionGroups(condition);
      
      groups.forEach((group: ConditionGroup) => {
        const groupForm = this.createConditionGroup(group.operator);
        const rulesArray = this.getRules(groupForm);
        
        group.rules.forEach((rule: Rule) => {
          const ruleForm = this.fb.group({
            field: [rule.field, Validators.required],
            comparison: [rule.comparison, Validators.required],
            value: [rule.value, this.conditionValueValidator()]
          });
          rulesArray.push(ruleForm);
        });

        if (group.nestedGroups?.length) {
          const nestedGroupsArray = this.getNestedGroups(groupForm);
          group.nestedGroups.forEach((nestedGroup: ConditionGroup) => {
            const nestedGroupForm = this.createConditionGroup(nestedGroup.operator);
            nestedGroup.rules.forEach((rule: Rule) => {
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

  private buildConditionString(group: ConditionGroup): string {
    const parts: string[] = [];
    const escapeString = (val: string) => `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    const isFlowVariable = (val: any): boolean => (
      typeof val === 'string' && val.startsWith(this.FLOW_VARIABLE_PREFIX)
    );
    const serializeValue = (value: any, valueType: string): string => {
      if (valueType === 'flowvariable') {
        let val = value;
        if (typeof val === 'string' && val.startsWith(this.FLOW_VARIABLE_PREFIX)) {
          val = val.substring(this.FLOW_VARIABLE_PREFIX.length);
        }
        if (!this.isValidFlowVariableName(val)) {
          throw new Error('Invalid flow variable name');
        }
        return `${this.FLOW_VARIABLE_PREFIX}${val}`;
      }
      if (valueType === 'number') {
        return String(Number(value));
      }
      if (valueType === 'boolean') {
        return value === true || value === 'true' ? 'true' : 'false';
      }
      if (valueType === 'string') {
        return escapeString(String(value));
      }
      if (valueType === 'any') {
        // Try to detect type: boolean, number, flow variable, or string
        if (typeof value === 'boolean' || value === 'true' || value === 'false') {
          return value === true || value === 'true' ? 'true' : 'false';
        }
        if (!isNaN(Number(value)) && value !== '' && value !== null) {
          return String(Number(value));
        }
        if (typeof value === 'string' && value.startsWith(this.FLOW_VARIABLE_PREFIX)) {
          return value;
        }
        return escapeString(String(value));
      }
      // fallback
      return escapeString(String(value));
    };
    const buildRule = (rule: Rule): string => {
      const { field, comparison, value: rawValue, valueType = 'any' } = rule;
      if (comparison === 'is_empty') {
        return `(!${field} || ${field} === "" || ${field} === undefined || ${field} === null || (Array.isArray(${field}) && ${field}.length === 0) || (typeof ${field} === 'object' && Object.keys(${field}).length === 0))`;
      }
      if (comparison === 'is_not_empty') {
        return `(${field} && ${field} !== "" && ${field} !== undefined && ${field} !== null && (!Array.isArray(${field}) || ${field}.length > 0) && (typeof ${field} !== 'object' || Object.keys(${field}).length > 0))`;
      }
      const value = serializeValue(rawValue, valueType);
      // Handle string-specific operations
      if (["contains", "not_contains", "starts_with", "ends_with"].includes(comparison)) {
        const methodMap: Record<string, string> = {
          contains: `.includes(${value})`,
          not_contains: `.includes(${value})`,
          starts_with: `.startsWith(${value})`,
          ends_with: `.endsWith(${value})`
        };
        const base = `(typeof ${field} === 'string' && ${field}${methodMap[comparison]})`;
        return comparison === 'not_contains' ? `!${base}` : base;
      }
      // Handle array membership
      if (comparison === 'in' || comparison === 'not_in') {
        const array = Array.isArray(rawValue) ? JSON.stringify(rawValue) : `[${serializeValue(rawValue, valueType)}]`;
        const expression = `${array}.includes(${field})`;
        return comparison === 'not_in' ? `!${expression}` : expression;
      }
      // Map comparisons to JS operators
      const operatorMap: Record<string, string> = {
        equals: '===',
        not_equals: '!==',
        greater_than: '>',
        less_than: '<',
        greater_equals: '>=',
        less_equals: '<='
      };
      const jsOperator = operatorMap[comparison];
      if (!jsOperator) throw new Error(`Unsupported comparison: ${comparison}`);
      // Flow variable direct comparison
      if (valueType === 'flowvariable') {
        return `${field} ${jsOperator} ${value}`;
      }
      // Null check
      if (rawValue === null) {
        return `${field} ${jsOperator} null`;
      }
      // Type checks
      if (valueType === 'string') {
        return `(typeof ${field} === 'string' && ${field} ${jsOperator} ${value})`;
      }
      if (valueType === 'number') {
        return `(typeof ${field} === 'number' && ${field} ${jsOperator} ${value})`;
      }
      if (valueType === 'boolean') {
        return `(typeof ${field} === 'boolean' && ${field} ${jsOperator} ${value})`;
      }
      if (valueType === 'any') {
        // No type check, just compare
        return `${field} ${jsOperator} ${value}`;
      }
      // fallback
      return `${field} ${jsOperator} ${value}`;
    };
    // Process rules
    if (group.rules?.length) {
      for (const rule of group.rules) {
        try {
          const result = buildRule(rule);
          if (result) parts.push(result);
        } catch (e) {
          console.warn(`Skipping invalid rule:`, rule, e);
        }
      }
    }
    // Process nested groups
    if (group.nestedGroups?.length) {
      for (const nested of group.nestedGroups) {
        const nestedStr = this.buildConditionString(nested);
        if (nestedStr) parts.push(`(${nestedStr})`);
      }
    }
    const logicalOp = group.operator === 'AND' ? '&&' : '||';
    return parts.join(` ${logicalOp} `);
  }

  private markFormGroupTouched(control: AbstractControl) {
    if (control instanceof FormGroup) {
      Object.values(control.controls).forEach(c => this.markFormGroupTouched(c));
    } else if (control instanceof FormArray) {
      control.controls.forEach(c => this.markFormGroupTouched(c));
    }
    control.markAsTouched();
  }

  private validateConditionForm() {
    this.markFormGroupTouched(this.conditionForm);
    Object.values(this.conditionForm.controls).forEach(control => {
      control.updateValueAndValidity();
    });
  }

  shouldShowValue(comparison: string | null | undefined): boolean {
    // Return false for comparisons that don't need a value input
    return !['is_empty', 'is_not_empty'].includes(comparison || '');
  }

  getExtendedPath(path: number[], index: number): number[] {
    return path ? [...path, index] : [index];
  }
}
