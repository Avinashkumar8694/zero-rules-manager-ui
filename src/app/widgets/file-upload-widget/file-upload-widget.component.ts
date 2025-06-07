import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'file-upload-widget',
  templateUrl: './file-upload-widget.component.html',
  styleUrls: ['./file-upload-widget.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
    standalone: false
})
export class FileUploadWidgetComponent {
  @Input() label: string = '';
  @Input() accept: string = '';
  @Input() disabled: boolean = false;
}
