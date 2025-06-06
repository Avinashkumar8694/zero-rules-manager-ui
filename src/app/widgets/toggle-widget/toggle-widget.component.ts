import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'toggle-widget',
  templateUrl: './toggle-widget.component.html',
  styleUrls: ['./toggle-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class ToggleWidgetComponent {
  @Input() label: string = '';
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
}
