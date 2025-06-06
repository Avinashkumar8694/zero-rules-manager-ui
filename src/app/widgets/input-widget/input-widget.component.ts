import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'input-widget',
  templateUrl: './input-widget.component.html',
  styleUrls: ['./input-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class InputWidgetComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() value: string = '';
  @Input() disabled: boolean = false;
}
