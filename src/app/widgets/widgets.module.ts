import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { createCustomElement } from '@angular/elements';
import { InputWidgetComponent } from './input-widget/input-widget.component';
import { FileWidgetComponent } from './file-widget/file-widget.component';
import { TypedInputWidgetComponent } from './typed-input-widget/typed-input-widget.component';
import { ToggleWidgetComponent } from './toggle-widget/toggle-widget.component';
import { InputMappingWidgetComponent } from './input-mapping-widget/input-mapping-widget.component';
import { DropdownWidgetComponent } from './dropdown-widget/dropdown-widget.component';
import { FileUploadWidgetComponent } from './file-upload-widget/file-upload-widget.component';
import { TypedInputMappingWidgetComponent } from './typed-input-mapping-widget/typed-input-mapping-widget.component';

@NgModule({
  declarations: [
    InputWidgetComponent,
    FileWidgetComponent,
    TypedInputWidgetComponent,
    ToggleWidgetComponent,
    InputMappingWidgetComponent,
    DropdownWidgetComponent,
    FileUploadWidgetComponent,
    TypedInputMappingWidgetComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    InputWidgetComponent,
    FileWidgetComponent,
    TypedInputWidgetComponent,
    ToggleWidgetComponent,
    InputMappingWidgetComponent,
    DropdownWidgetComponent,
    FileUploadWidgetComponent,
    TypedInputMappingWidgetComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WidgetsModule {
  constructor(private injector: Injector) {
    // Define custom elements after DOM content is loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.defineCustomElements();
    });
  }

  private defineCustomElements(): void {
    const elements = [
      { selector: 'input-widget', component: InputWidgetComponent },
      { selector: 'file-widget', component: FileWidgetComponent },
      { selector: 'typed-input-widget', component: TypedInputWidgetComponent },
      { selector: 'toggle-widget', component: ToggleWidgetComponent },
      { selector: 'input-mapping-widget', component: InputMappingWidgetComponent },
      { selector: 'dropdown-widget', component: DropdownWidgetComponent },
      { selector: 'file-upload-widget', component: FileUploadWidgetComponent },
      { selector: 'typed-input-mapping-widget', component: TypedInputMappingWidgetComponent }
    ];

    elements.forEach(({ selector, component }) => {
      if (!customElements.get(selector)) {
        const elementConstructor = createCustomElement(component, { injector: this.injector });
        customElements.define(selector, elementConstructor);
      }
    });
  }
}
