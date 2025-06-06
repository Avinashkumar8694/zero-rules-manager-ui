import { Component, Input, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'input-widget',
  templateUrl: './input-widget.component.html',
  styleUrls: ['./input-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class InputWidgetComponent implements OnInit, OnChanges {
  @Input() label: string = '';
  @Input() placeholder: string | string[] = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() disabled: boolean = false;

  ngOnInit() {
    this.parsePlaceholder();
  }

  ngOnChanges() {
    this.parsePlaceholder();
  }

  private parsePlaceholder() {
    if (Array.isArray(this.placeholder)) {
      this.placeholder = this.placeholder.join(', ');
    }
  }
}
