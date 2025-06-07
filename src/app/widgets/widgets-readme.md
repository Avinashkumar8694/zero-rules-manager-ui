# Widgets Module

The Widgets Module provides reusable UI components as custom elements that can be used in dynamic node HTML or any Angular application. These widgets maintain consistent styling and behavior across different nodes.

## Available Widgets

### 1. Input Widget
- **Selector**: `<input-widget>`
- **Attributes**:
  - `label`: Label for the input field
  - `placeholder`: Placeholder text
  - `type`: Input type (e.g., `text`, `number`, `email`)
  - `value`: Initial value
  - `disabled`: Disable the input field
```html
<!-- Basic Usage -->
<input-widget 
  label="User Name" 
  placeholder="Enter your name"
  type="text"
  value="John Doe">
</input-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <input-widget 
    label="API Key" 
    type="password"
    placeholder="Enter your API key">
  </input-widget>
</div>
```

### 2. Typed Input Widget
- **Selector**: `<typed-input-widget>`
- **Attributes**:
  - `label`: Label for the input
  - `options`: Array of data types (`String`, `Number`, `Boolean`, etc.)
  - `type`: Input type for the value field
  - `value`: Initial value
  - `disabled`: Disable the input
```html
<!-- Basic Usage -->
<typed-input-widget 
  label="Amount" 
  type="number"
  value="100"
  options='["Number", "String"]'>
</typed-input-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <typed-input-widget 
    label="Response Type" 
    options='["JSON", "Text", "Binary"]'
    value="JSON">
  </typed-input-widget>
</div>
```

### 3. Toggle Widget
- **Selector**: `<toggle-widget>`
- **Attributes**:
  - `label`: Label for the toggle
  - `checked`: Initial state (true/false)
  - `disabled`: Disable the toggle
```html
<!-- Basic Usage -->
<toggle-widget 
  label="Enable Notifications" 
  checked="true">
</toggle-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <toggle-widget 
    label="Use Authentication"
    checked="false">
  </toggle-widget>
</div>
```

### 4. Input Mapping Widget
- **Selector**: `<input-mapping-widget>`
- **Attributes**:
  - `sourceLabel`: Label for the source input
  - `targetLabel`: Label for the target input
  - `sourceValue`: Initial value for source
  - `targetValue`: Initial value for target
```html
<!-- Basic Usage -->
<input-mapping-widget 
  sourceLabel="Input Field" 
  targetLabel="Mapped Field"
  sourceValue="firstName"
  targetValue="first_name">
</input-mapping-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <input-mapping-widget 
    sourceLabel="Request Field" 
    targetLabel="Database Column"
    sourceValue="userId"
    targetValue="user_id">
  </input-mapping-widget>
</div>
```

### 5. Dropdown Widget
- **Selector**: `<dropdown-widget>`
- **Attributes**:
  - `label`: Label for the dropdown
  - `options`: Array of options
  - `selected`: Selected value
  - `disabled`: Disable the dropdown
```html
<!-- Basic Usage -->
<dropdown-widget 
  label="Country" 
  options='["USA", "UK", "Canada"]'
  selected="USA">
</dropdown-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <dropdown-widget 
    label="HTTP Method"
    options='["GET", "POST", "PUT", "DELETE"]'
    selected="GET">
  </dropdown-widget>
</div>
```

### 6. File Widget
- **Selector**: `<file-widget>`
- **Attributes**:
  - `label`: Label for the file input
  - `accept`: Accepted file types (e.g., `.pdf,.doc`)
  - `disabled`: Disable the file input
```html
<!-- Basic Usage -->
<file-widget 
  label="Upload Document" 
  accept=".pdf,.doc,.docx">
</file-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <file-widget 
    label="Import Configuration"
    accept=".json,.yaml">
  </file-widget>
</div>
```

### 7. File Upload Widget
- **Selector**: `<file-upload-widget>`
- **Attributes**:
  - `label`: Label for the file upload
  - `accept`: Accepted file types
  - `disabled`: Disable the file upload
```html
<!-- Basic Usage -->
<file-upload-widget 
  label="Upload Images" 
  accept="image/*">
</file-upload-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <file-upload-widget 
    label="Upload CSV"
    accept=".csv">
  </file-upload-widget>
</div>
```

### 8. Typed Input Mapping Widget
- **Selector**: `<typed-input-mapping-widget>`
- **Attributes**:
  - `sourceLabel`: Label for the source input
  - `targetLabel`: Label for the target input
  - `sourceType`: Type for the source input
  - `targetType`: Type for the target input
  - `sourceValue`: Initial value for source
  - `targetValue`: Initial value for target
```html
<!-- Basic Usage -->
<typed-input-mapping-widget
  sourceLabel="Source Field"
  targetLabel="Target Field"
  [sourceOptions]="['String', 'Number', 'Boolean']"
  [targetOptions]="['String', 'Number', 'Boolean']"
  sourceValue="initial value"
  targetValue="mapped value">
</typed-input-mapping-widget>

<!-- In Dynamic Node HTML -->
<div class="node-attribute">
  <typed-input-mapping-widget
    sourceLabel="Input Parameter"
    targetLabel="Output Parameter"
    sourceOptions='["String", "Number", "Boolean"]'
    targetOptions='["String", "Number", "Boolean"]'>
  </typed-input-mapping-widget>
</div>
```

## Usage in Dynamic Nodes

### 1. In Node HTML Template
```html
<div class="node-attributes">
  <typed-input-widget 
    label="Server URL" 
    type="text"
    options='["String"]'
    value="https://api.example.com">
  </typed-input-widget>
  
  <dropdown-widget 
    label="Request Method"
    options='["GET", "POST", "PUT", "DELETE"]'
    selected="GET">
  </dropdown-widget>
  
  <toggle-widget 
    label="Use Authentication"
    checked="true">
  </toggle-widget>
  
  <input-mapping-widget 
    sourceLabel="Request Headers" 
    targetLabel="Custom Headers"
    sourceValue="Content-Type"
    targetValue="application/json">
  </input-mapping-widget>
</div>
```

### 2. Styling in Node HTML
All widgets automatically inherit the global styles, but you can customize them within your node:

```html
<style>
.node-attributes {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Target specific widget if needed */
typed-input-widget {
  margin-bottom: 8px;
}
</style>
```

## Events
All widgets emit standard DOM events that you can listen to:

```javascript
// Example event handling in node's script
document.querySelector('input-widget').addEventListener('change', (event) => {
  console.log('New value:', event.target.value);
});
```

## Best Practices
1. Always provide a meaningful `label` for better accessibility
2. Use appropriate `type` attributes for input widgets
3. Group related widgets using semantic HTML
4. Follow the node attributes structure for consistent layout
5. Use the widget's built-in validation features instead of custom validation
