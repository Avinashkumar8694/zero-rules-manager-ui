import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'file-widget',
  templateUrl: './file-widget.component.html',
  styleUrls: ['./file-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
  standalone: false
})
export class FileWidgetComponent {
  @Input() label: string = '';
  @Input() accept: string = '';
  @Input() disabled: boolean = false;
}
