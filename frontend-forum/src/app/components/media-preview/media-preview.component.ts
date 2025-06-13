import {Component, Inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-media-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="media-preview">
      <button mat-icon-button class="close-button" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
      @if (isImageUrl(data.url)) {
        <img [src]="data.url" alt="Preview">
      } @else if (isVideoUrl(data.url)) {
        <video controls>
          <source [src]="data.url" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      }
    </div>
  `,
  styles: [`
    .media-preview {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.9);
      padding: 20px;
    }

    .close-button {
      position: absolute;
      top: 10px;
      right: 10px;
      color: white;
    }

    img, video {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
    }
  `]
})
export class MediaPreviewComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {}

  isImageUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  close(): void {
  }
}
