import { Component, Input, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'dropdown-widget',
  templateUrl: './dropdown-widget.component.html',
  styleUrls: ['./dropdown-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class DropdownWidgetComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() options: string[] = [];
  @Input() selected: string = '';
  @Input() disabled: boolean = false;

  ngOnInit() {
    this.options = this.parseOptions(this.options);
  }

  ngOnChanges() {
    this.options = this.parseOptions(this.options);
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
