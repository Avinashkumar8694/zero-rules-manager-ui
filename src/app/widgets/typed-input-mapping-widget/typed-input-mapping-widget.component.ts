import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'typed-input-mapping-widget',
  templateUrl: './typed-input-mapping-widget.component.html',
  styleUrls: ['./typed-input-mapping-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class TypedInputMappingWidgetComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() sourceLabel: string = '';
  @Input() targetLabel: string = '';
  @Input() sourceValue: string = '';
  @Input() targetValue: string = '';
  @Input() sourceOptions: string[] = [];
  @Input() targetOptions: string[] = [];
  @Input() disabled: boolean = false;

  @Output() sourceValueChange = new EventEmitter<string>();
  @Output() targetValueChange = new EventEmitter<string>();
  @Output() sourceSelectedTypeChange = new EventEmitter<string>();
  @Output() targetSelectedTypeChange = new EventEmitter<string>();

  sourceSelectedType: string = '';
  targetSelectedType: string = '';

  constructor(private cdr: ChangeDetectorRef) { }  ngOnInit() {
    this.initializeOptions();
    this.cdr.detectChanges();
  }

  ngOnChanges() {
    this.initializeOptions();
    this.cdr.detectChanges();
  }

  private parseOptions(options: any, defaultOptions: string[]): string[] {
    if (!options || (Array.isArray(options) && options.length === 0)) {
      return [...defaultOptions];
    }
    if (typeof options === 'string') {
      let str = options.trim();
      // Convert single quotes to double quotes for JSON.parse compatibility
      if (str.startsWith("[") && str.includes("'")) {
        str = str.replace(/'/g, '"');
      }
      try {
        return JSON.parse(str);
      } catch (e) {
        console.warn('Failed to parse options string:', options, e);
        return [...defaultOptions];
      }
    }
    if (Array.isArray(options)) {
      return [...options];
    }
    return [...defaultOptions];
  }

  private initializeOptions() {
    const defaultOptions = ['String', 'Number', 'Boolean'];
    this.sourceOptions = this.parseOptions(this.sourceOptions, defaultOptions);
    this.targetOptions = this.parseOptions(this.targetOptions, defaultOptions);

    // Set default selected types, ensuring they exist in the options
    this.sourceSelectedType = this.sourceOptions.includes(this.sourceSelectedType)
      ? this.sourceSelectedType
      : this.sourceOptions[0] || defaultOptions[0];

    this.targetSelectedType = this.targetOptions.includes(this.targetSelectedType)
      ? this.targetSelectedType
      : this.targetOptions[0] || defaultOptions[0];

    // Log for debugging
    console.log('Source Options:', this.sourceOptions);
    console.log('Target Options:', this.targetOptions);
    console.log('Source Selected:', this.sourceSelectedType);
    console.log('Target Selected:', this.targetSelectedType);
  }
}
