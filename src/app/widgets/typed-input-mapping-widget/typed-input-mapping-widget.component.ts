import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'typed-input-mapping-widget',
  templateUrl: './typed-input-mapping-widget.component.html',
  styleUrls: ['./typed-input-mapping-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class TypedInputMappingWidgetComponent {
  @Input() sourceLabel: string = '';
  @Input() targetLabel: string = '';
  @Input() sourceValue: string = '';
  @Input() targetValue: string = '';
  @Input() sourceOptions: string[] = [];
  @Input() targetOptions: string[] = [];
  @Input() disabled: boolean = false;

  sourceSelectedType: string = '';
  targetSelectedType: string = '';

  ngOnInit() {
    // Parse options if they're passed as strings
    if (typeof this.sourceOptions === 'string') {
      try {
        this.sourceOptions = JSON.parse(this.sourceOptions);
      } catch (e) {
        console.warn('Failed to parse source options string:', e);
        this.sourceOptions = [];
      }
    }
    if (typeof this.targetOptions === 'string') {
      try {
        this.targetOptions = JSON.parse(this.targetOptions);
      } catch (e) {
        console.warn('Failed to parse target options string:', e);
        this.targetOptions = [];
      }
    }
    
    // Set default selected types
    this.sourceSelectedType = this.sourceOptions[0] || '';
    this.targetSelectedType = this.targetOptions[0] || '';
  }
}
