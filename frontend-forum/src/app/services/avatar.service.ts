import {Injectable} from '@angular/core';
import {UserService} from './user.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private avatarCache = new Map<string, SafeUrl>();

  constructor(
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  loadAvatar(userId: string): Observable<SafeUrl> {
    if (this.avatarCache.has(userId)) {
      return new Observable<SafeUrl>(observer => {
        observer.next(this.avatarCache.get(userId)!);
        observer.complete();
      });
    }

    return this.userService.getAvatarAsBlob(userId).pipe(
      map(blob => {
        const url = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.avatarCache.set(userId, safeUrl);
        return safeUrl;
      })
    );
  }

  getAvatarUrl(userId: string): string | SafeUrl {
    return this.avatarCache.get(userId) || 'assets/images/default-avatar.png';
  }

  clearCache() {
    this.avatarCache.clear();
  }
}
