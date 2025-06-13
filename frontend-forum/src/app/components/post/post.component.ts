import {Component, input, OnInit, output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MarkdownComponent} from 'ngx-markdown';
import {lastValueFrom} from 'rxjs/internal/lastValueFrom';
import {PostService} from '../../services/post.service';
import {CommentSectionComponent} from '../comment/comment-section.component';
import {AuthService} from '../../services/auth.service';
import {Post, User} from '../../models/models';
import {AvatarService} from '../../services/avatar.service';
import {SafeUrl} from '@angular/platform-browser';
import {MatDialog} from '@angular/material/dialog';
import {MediaPreviewComponent} from '../media-preview/media-preview.component';
import {MediaService} from '../../services/media.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MarkdownComponent,
    CommonModule,
    CommentSectionComponent,
    FormsModule
  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent implements OnInit {
  post = input.required<Post>();
  userSelected = output<User>();
  liked = output<{ postId: number, like: boolean }>();
  commentAdded = output<{ postId: number, text: string }>();
  postState = signal<Post | null>(null);
  showComments = false;
  mediaUrls = signal<Map<string, SafeUrl>>(new Map());
  isEditing = signal<boolean>(false);
  editContent = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private avatarService: AvatarService,
    private mediaService: MediaService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const inputPost = this.post();
    console.log('Input post:', inputPost);
    console.log('Media URLs:', inputPost.mediaUrls);

    this.postState.set({
      ...inputPost,
      id: inputPost.id,
      likes: inputPost.likes || 0,
      comments: inputPost.comments || 0
    });

    this.loadPostDetails();
    this.loadMediaUrls();
    
    if (this.postState()?.author?.avatarUrl) {
      this.avatarService.loadAvatar(this.postState()!.author!.userId).subscribe();
    }
  }

  private loadMediaUrls(): void {
    const post = this.postState();
    if (!post?.mediaUrls?.length) return;

    this.mediaUrls.set(new Map());

    post.mediaUrls.forEach(url => {
      this.mediaService.getMediaUrl(url).subscribe({
        next: (safeUrl) => {
          this.mediaUrls.update(urls => {
            const newUrls = new Map(urls);
            newUrls.set(url, safeUrl);
            return newUrls;
          });
        },
        error: (error) => {
          console.error('Error loading media:', error);
        }
      });
    });
  }

  reloadMediaUrls(): void {
    this.loadMediaUrls();
  }

  getMediaUrl(url: string): SafeUrl | string {
    return this.mediaUrls()?.get(url) || url;
  }

  async loadPostDetails() {
    if (!this.postState()) {
      console.error('postState is null in loadPostDetails');
      return;
    }

    const postId = this.postState()!.id;

    try {
      const [likes, comments] = await Promise.all([
        lastValueFrom(this.postService.getLikes(postId)),
        lastValueFrom(this.postService.getComments(postId))
      ]);

      this.postState.update(p => {
        if (!p) return null;
        return {
          ...p,
          currentUserLiked: likes.some(like => like.user?.userId === this.authService.currentUser()?.userId),
          likes: likes.length,
          comments: comments.length
        };
      });
    } catch (error) {
      console.error('Error loading post details:', error);
    }
  }

  getAvatarUrl(userId: string): string | SafeUrl {
    return this.avatarService.getAvatarUrl(userId);
  }

  toggleComments() {
    this.showComments = !this.showComments;
  }

  async toggleLike(postId: number) {
    if (!this.postState()) return;

    try {
      const like = !this.postState()!.currentUserLiked;
      if (like) {
        await lastValueFrom(this.postService.likePost(postId));
      } else {
        await lastValueFrom(this.postService.unLikePost(postId));
      }
      
      this.postState.update(p => {
        if (!p) return null;
        return {
          ...p,
          currentUserLiked: like,
          likes: like ? (p.likes || 0) + 1 : (p.likes || 1) - 1
        };
      });

      this.liked.emit({ postId, like });
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  onCommentAdded(text: string) {
    if (!this.postState()) return;
    
    this.postState.update(p => {
      if (!p) return null;
      return {
        ...p,
        comments: (p.comments || 0) + 1
      };
    });

    this.commentAdded.emit({ postId: this.postState()!.id, text });
  }

  selectUser(user: User | null) {
    if (user != null) {
      this.userSelected.emit(user);
    }
  }

  isImageUrl(url: string): boolean {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    console.log('Checking if image URL:', url, isImage);
    return isImage;
  }

  isVideoUrl(url: string): boolean {
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
    console.log('Checking if video URL:', url, isVideo);
    return isVideo;
  }

  getVideoType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return `video/${extension}`;
  }

  openMediaPreview(url: string): void {
    this.dialog.open(MediaPreviewComponent, {
      data: { url: this.getMediaUrl(url) },
      maxWidth: '90vw',
      maxHeight: '90vh'
    });
  }

  handleMediaError(event: Event): void {
    const target = event.target as HTMLImageElement | HTMLVideoElement;
    console.error('Error loading media:', target.src);
    if (target instanceof HTMLImageElement) {
      target.src = 'assets/images/error-image.png';
    }
  }

  isAuthor(): boolean {
    const currentUser = this.authService.currentUser();
    return currentUser?.userId === this.postState()?.author?.userId;
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.cancelEdit();
    } else {
      this.editContent = this.postState()?.content || '';
      this.isEditing.set(true);
    }
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editContent = '';
  }

  async saveEdit(): Promise<void> {
    if (!this.postState() || !this.editContent.trim()) return;
    try {
      const updatedPost = await lastValueFrom(this.postService.updatePost(this.postState()!.id, { content: this.editContent })) as Post;
      this.postState.set(updatedPost);
      this.isEditing.set(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  }
}
