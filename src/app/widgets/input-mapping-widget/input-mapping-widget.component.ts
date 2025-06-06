import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'input-mapping-widget',
  templateUrl: './input-mapping-widget.component.html',
  styleUrls: ['./input-mapping-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class InputMappingWidgetComponent {
  @Input() sourceLabel: string = '';
  @Input() targetLabel: string = '';
  @Input() sourceValue: string = '';
  @Input() targetValue: string = '';
}
