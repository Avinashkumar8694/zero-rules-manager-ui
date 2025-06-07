import { Component, Input, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'typed-input-widget',
  templateUrl: './typed-input-widget.component.html',
  styleUrls: ['./typed-input-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class TypedInputWidgetComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() options: string[] = [];
  @Input() disabled: boolean = false;
  
  selectedType: string = '';

  ngOnInit() {
    this.options = this.parseOptions(this.options);
    this.selectedType = this.options[0] || '';
  }

  ngOnChanges() {
    this.options = this.parseOptions(this.options);
    if (!this.selectedType || !this.options.includes(this.selectedType)) {
      this.selectedType = this.options[0] || '';
    }
  }

  private parseOptions(options: any): string[] {
    if (!options || (Array.isArray(options) && options.length === 0)) {
      return [];
    }
    if (typeof options === 'string') {
      let str = options.trim();
      if (str.startsWith('[') && str.includes("'")) {
        str = str.replace(/'/g, '"');
      }
      try {
        return JSON.parse(str);
      } catch (e) {
        console.warn('Failed to parse options string:', options, e);
        return [];
      }
    }
    if (Array.isArray(options)) {
      return [...options];
    }
    return [];
  }
}
