import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';

@Component({
  selector: 'typed-input-widget',
  templateUrl: './typed-input-widget.component.html',
  styleUrls: ['./typed-input-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class TypedInputWidgetComponent implements OnInit {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() options: string[] = [];
  @Input() disabled: boolean = false;
  
  selectedType: string = '';

  ngOnInit() {
    // Parse options if they're passed as a string
    if (typeof this.options === 'string') {
      try {
        this.options = JSON.parse(this.options);
      } catch (e) {
        console.warn('Failed to parse options string:', e);
        this.options = [];
      }
    }
    
    // Set default selected type
    this.selectedType = this.options[0] || '';
  }
}
