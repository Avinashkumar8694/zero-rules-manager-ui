Node Registration Architecture: Detailed Technical Overview
🔧 1. Purpose of Node Files (e.g., Node-1.html)
These HTML files define the structure and behavior of custom visual nodes for a low-code or flow-based UI editor. Each node:

Provides a UI template (via <script type="text/x-red">)

Contains configuration logic via JavaScript (registerNode)

📎 2. Structure of a Node File
Each node file typically includes:

A. Template Script
html
Copy
Edit
<script type="text/x-red" data-template-name="FileIn">
    <!-- UI inputs like text, radio, select, etc. -->
</script>
data-template-name="FileIn": Key identifier for the node.

Contents: HTML elements with IDs and classes expected by the node editor (e.g., node-input-*, node-select-*).

Used to render the config form when the node is selected.

B. Node Registration Script
html
Copy
Edit
<script type="text/javascript">
    registerNode({ nodeType: 'FileIn', ... });
</script>
Invokes a globally defined registerNode() function that stores this node’s definition and behavior in the runtime registry.

🧱 3. registerNode Function
ts
Copy
Edit
registerNode({
  nodeType: 'FileIn',
  serviceType: 'server',
  nodeDef: {
    ...
  }
});
Key Properties:
nodeType: Must match data-template-name in the corresponding <script> template.

serviceType: Helps categorize the node (e.g., frontend/backend/server).

nodeDef: Main node definition object.

nodeDef Structure:
defaults: Default values for the node’s properties.

inputs/outputs: Number of ports on the node.

paletteLabel, label, labelStyle: UI text rendering.

oneditprepare(SRD): Hook called when config UI opens.

oneditsave(): Hook called when user saves the config.

docsLink: Optional documentation reference.

🧩 4. Lifecycle Hooks
oneditprepare(SRD)
Executed when the config window for the node opens. Used to:

Populate fields.

Attach event listeners (e.g., radio toggle behavior).

Initialize advanced inputs (typedInput, selectField).

oneditsave()
Executed when the user saves the form. Used to:

Extract values from the UI.

Transform and assign data to the node definition.

🛠 5. Advanced Input Widgets
These are initialized using jQuery-based extensions:

typedInput: Allows selection of a type (like bh.input) and a value.

selectField: Custom dropdown with grouped options (e.g., encoding).

They often accept:

types: Array of type options (e.g., bh, str).

noformvalidation: Skips browser-based validation.

🔄 6. Angular Integration
To make this work inside your Angular app:

A. Loading HTML Nodes
Use an Angular service or loader to dynamically load .html node files.

Inject them into a container or register them globally.

B. registerNode Integration
registerNode() must be defined globally (e.g., in window) or imported as a service.

Each node’s <script> block must execute once the HTML is injected (e.g., using eval() or script tag injection).

C. Using <app-attribute-window>
Make sure:

The component is declared in the module where <app-attribute-window> is used (nodes-list.component.ts module).

Exported from its own module if it's in a shared folder.

Imported in NodesModule or a parent module.

🚨 7. Common Errors
NG8001 - 'app-attribute-window' is not a known element:
Occurs when:

AttributeWindowComponent is not declared in the same module or imported via a shared module.

You're missing its module in NodesModule or nodes-routing.module.ts.

Fix:
Ensure AttributeWindowComponent is:

Declared in a module (e.g., NodesModule)

Exported (if in a shared module)

Imported properly

📌 8. Component Communication (Optional)
To connect the dynamic node to Angular logic (e.g., toggle fields, show/hide config):

Use @ViewChild('attrWin') attrWin!: AttributeWindowComponent;

Communicate between parent (nodes-list.component.ts) and AttributeWindowComponent.

📚 9. Suggested File Structure
bash
Copy
Edit
features/
└── nodes/
    ├── components/
    │   ├── attribute-window/
    │   │   ├── attribute-window.component.ts
    │   │   └── attribute-window.component.html
    │   └── nodes-list/
    │       └── nodes-list.component.ts
    ├── node-definitions/
    │   └── FileIn.html  <-- Raw HTML + JS node file
    ├── services/
    └── nodes.module.ts
✅ Summary
Element	Role
data-template-name	Identifies the node’s template
registerNode()	Registers the node logic and metadata
oneditprepare()	Prepares the edit UI
oneditsave()	Extracts and saves values
typedInput, selectField	Enhanced UI inputs
Angular module declaration	Ensures component availability

If you need help setting up the Angular loader for HTML node files or want to convert your nodes to reusable Angular components, I can guide you further.


node example template:

```html
<!-- FileIn.html -->
<!-- Template Scrip
<script type="text/x-red" data-template-name="FileIn">
    <!-- File Path -->
    <div id="node-input-file-path-wrp" class="editor-form-row">
        <label for="node-input-file-path"><span data-i18n="common.label.filepath"></span></label>
        <input type="text" id="node-input-file-path" class="node-input-property" style="width: 100%" />
    </div>

    <!-- Format -->
    <div id="node-input-format-wrp" class="editor-form-row">
        <label for="node-select-filein-format"><span data-i18n="filein.label.format"></span></label>
        <br><input type="radio" id="buffer" form-radio name="filein-format" value="buffer">
        <label for="buffer" style="font-size: 0.9em">Buffer</label><br>
        <input type="radio" id="stream" form-radio name="filein-format" value="stream">
        <label for="stream" style="font-size: 0.9em">Stream</label><br>
        <input type="radio" id="utf8" form-radio name="filein-format" value="utf8">
        <label for="utf8" style="font-size: 0.9em">Encoded</label>
    </div>
    <!-- Encoding -->
    <div id="node-select-encoding-wrp" class="editor-form-row">
        <label for="node-select-filein-encoding"><span data-i18n="filein.label.encoding"></span></label>
        <select id="node-select-filein-encoding" style="width: 100%;">
        </select>
    </div>

    <!-- resultMapping -->
    <div id="node-input-result-mapping-wrp" class="editor-form-row">
        <label for="node-input-result-mapping"><span
                data-i18n="common.label.filemapping"></span></label>
        <input type="text" id="node-input-result-mapping" class="node-input-property" style="width: 100%" />
    </div>
</script>

<script type="text/javascript">
    registerNode({
        nodeType: 'FileIn',
        serviceType: 'server',
        nodeDef: {
            color: '#6AB5BC',
            category: 'File Operation',
            defaults: {
                name: {
                    value: '',
                },
                encoding: {
                    value: 'utf8',
                },
                outputs: {
                    value: 1,
                },
                format: {
                    value: 'buffer',
                },
                filepath: { value: '', required: true },
                resultMapping: {
                    value: { type: 'bh.input', value: '' },
                    required: true,
                },
            },
            inputs: 1,
            outputs: 1,
            icon: 'ndefault-file/file-in-node.svg',
            paletteLabel: function (def) {
                return 'File In';
            },
            label: function () {
                return this.name || 'File In';
            },
            labelStyle: function () {
                return this.name ? 'node_label_italic' : '';
            },
            oneditprepare: function (SRD) {
                const node = this;
                const doneBtn = $('#node-dialog-ok');
                const commonTypes = ['bh', 'bh.input', 'bh.local'];
                const kvSpecificTypes = [
                    { value: 'str', label: 'string', validate: /[^\s]+/ },
                ];

                /* Select the type of encoding. */
                var data = SRD._('common.encoding');
                const encoding = $('#node-select-filein-encoding').selectField({
                    optionsgroupData: JSON.parse(data.replace(/'/g, '"')),
                    value: node.encoding,
                });
                const filepath = $('#node-input-file-path').typedInput({
                    types: [...commonTypes, ...kvSpecificTypes],
                    noformvalidation: false,
                });

                /* Result Mapping field */
                const resultMapping = $(
                    '#node-input-result-mapping'
                ).typedInput({
                    types: commonTypes,
                    noformvalidation: false,
                });
                $('#node-select-encoding-wrp').hide();
                $('#utf8').on('click', function () {
                    $('#node-select-encoding-wrp').show();
                });
                $('#stream').on('click', function () {
                    $('#node-select-encoding-wrp').hide();
                });
                $('#buffer').on('click', function () {
                    $('#node-select-encoding-wrp').hide();
                });

                /* Set values for key and value fields if already exists */
                if (node.resultMapping.value) {
                    resultMapping.typedInput('type', node.resultMapping.type);
                    resultMapping.typedInput('value', node.resultMapping.value);
                }
                if (node.filepath) {
                    filepath.typedInput('type', node.filepath.type);
                    filepath.typedInput('value', node.filepath.value);
                }
                if (node.format) {
                    document.getElementById(node.format).checked = true;
                    if (node.format === 'utf8') {
                        $('#node-select-encoding-wrp').show();
                    }
                }
                if (node.encoding) {
                    document.getElementById(
                        'node-select-filein-encoding'
                    ).value = node.encoding;
                }
            },
            oneditsave: function () {
                const node = this;
                const resMap = $('#node-input-result-mapping');
                const filepath = $('#node-input-file-path');
                node.name = $('#node-input-name').val();

                /* node property assignments */
                node.filepath = {
                    type: filepath.typedInput('type'),
                    value: filepath.typedInput('value'),
                };
                node.format = document.querySelector(
                    'input[name="filein-format"]:checked'
                ).value;
                if (node.format === 'utf8') {
                    node.encoding = $('#node-select-filein-encoding').val();
                } else {
                    node.encoding = undefined;
                }
                node.resultMapping = {
                    type: resMap.typedInput('type'),
                    value: resMap.typedInput('value'),
                };
            },
            docsLink: 'file-in-node',
        },
    });
</script>

``` //FileIn.html end