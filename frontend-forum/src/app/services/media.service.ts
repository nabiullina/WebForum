import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private baseUrl = '/api';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  uploadMedia(postId: number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post(`${this.baseUrl}/posts/${postId}/media`, formData);
  }

  getMediaUrl(path: string): Observable<SafeUrl> {
    const url = `${this.baseUrl}/media?path=${path}`;
    console.log('MediaService: Fetching media from URL:', url);

    return this.http.get(url, { responseType: 'blob' }).pipe(
      map(blob => {
        console.log('MediaService: Received blob with type:', blob.type, 'for path:', path);
        let typedBlob = blob;

        if (this.isVideoFileName(path)) {
          const videoType = this.getVideoMimeTypeFromPath(path);
           if (blob.type === '' || blob.type === 'application/octet-stream' || blob.type !== videoType) {
             console.log(`MediaService: Blob type ${blob.type} is generic/incorrect. Creating new blob with type: ${videoType}`);
             typedBlob = new Blob([blob], { type: videoType });
             console.log('MediaService: New blob type:', typedBlob.type);
           }
        }

        const objectUrl = URL.createObjectURL(typedBlob);
        console.log('MediaService: Created object URL:', objectUrl);
        return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      })
    );
  }

  private getVideoMimeTypeFromPath(path: string): string {
      const extension = path.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'ogg': return 'video/ogg';
        case 'mov': return 'video/quicktime';
        default: return 'application/octet-stream';
      }
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  getFileType(file: File): 'image' | 'video' | 'other' {
    if (this.isImageFile(file)) return 'image';
    if (this.isVideoFile(file)) return 'video';
    return 'other';
  }

  private isVideoFileName(fileName: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  handleMediaError(event: Event): void {
    const target = event.target as HTMLImageElement | HTMLVideoElement;
    console.error('Media Loading Error:', target.src, 'Event:', event);
    if (target instanceof HTMLImageElement) {
      target.src = 'assets/images/error-image.png';
    }
    if (target instanceof HTMLVideoElement) {
      console.error('Video Error Code:', target.error?.code);
      console.error('Video Error Message:', target.error?.message);
      switch(target.error?.code) {
        case 1: console.error('Video playback aborted.'); break;
        case 2: console.error('A network error caused the video download to fail.'); break;
        case 3: console.error('The video playback was aborted due to a corruption problem or because the video used features the browser did not support.'); break;
        case 4: console.error('The video could not be loaded, either because the server or network failed or because the format is not supported.'); break;
        default: console.error('An unknown video error occurred.'); break;
      }
    }
  }
}
