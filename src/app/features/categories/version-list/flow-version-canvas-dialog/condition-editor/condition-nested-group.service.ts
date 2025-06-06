import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ConditionNestedGroupService {
  constructor(private fb: FormBuilder) {}

  addNestedGroup(
    parentGroup: AbstractControl | null, 
    createGroup: () => FormGroup, 
    createRule: () => FormGroup
  ) {
    if (!parentGroup) return;
    
    const nestedGroup = createGroup();
    const nestedGroupsArray = this.getNestedGroups(parentGroup);
    
    // Add default rule to nested group
    const rule = createRule();
    this.getRules(nestedGroup).push(rule);
    
    // Add nested group to parent's array
    nestedGroupsArray.push(nestedGroup);
    
    // Force form validation
    parentGroup.updateValueAndValidity();
  }

  removeNestedGroup(parentGroup: AbstractControl | null, index: number) {
    if (!parentGroup) return;
    
    const nestedGroups = this.getNestedGroups(parentGroup);
    if (nestedGroups.length > 0) {
      nestedGroups.removeAt(index);
      parentGroup.updateValueAndValidity();
    }
  }

  getRules(group: AbstractControl): FormArray {
    return group.get('rules') as FormArray; 
  }

  private getNestedGroups(group: AbstractControl): FormArray {
    if (!(group instanceof FormGroup)) {
      console.warn('Expected FormGroup for nested groups');
      return this.fb.array([]);
    }

    const nestedGroups = group.get('nestedGroups');
    if (!nestedGroups) {
      const newArray = this.fb.array([]);
      group.addControl('nestedGroups', newArray);
      return newArray;
    }
    
    return nestedGroups as FormArray;
  }
}
