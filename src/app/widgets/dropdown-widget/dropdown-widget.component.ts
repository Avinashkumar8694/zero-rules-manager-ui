import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'dropdown-widget',
  templateUrl: './dropdown-widget.component.html',
  styleUrls: ['./dropdown-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class DropdownWidgetComponent {
  @Input() label: string = '';
  @Input() options: string[] = [];
  @Input() selected: string = '';
  @Input() disabled: boolean = false;
}
