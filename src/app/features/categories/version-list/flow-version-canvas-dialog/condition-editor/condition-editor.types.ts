export interface ConditionEditorData {
  sourceNodeId: string;
  targetNodeId: string;
  condition?: string;
  name?: string;
  sourceNode: any;
  targetNode: any;
}

export interface Rule {
  field: string;
  comparison: string;
  value: string | number | boolean;
  isFlowVariable?: boolean;
  valueType?: 'string' | 'number' | 'boolean' | 'array';
}

export interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: Rule[];
  nestedGroups?: ConditionGroup[];
  level?: number;
}
