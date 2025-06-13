import {Component, EventEmitter, Input, OnInit, Output, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {PostService} from '../../services/post.service';
import {lastValueFrom} from 'rxjs/internal/lastValueFrom';
import {FormsModule} from '@angular/forms';
import {Comment, User} from '../../models/models';
import {CommentService} from '../../services/comment.service';
import {AvatarService} from '../../services/avatar.service';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {
  @Input({ required: true }) postId!: number;
  @Input() initialComments: Comment[] = [];
  @Output() userSelected = new EventEmitter<User>();
  @Output() commentAdded = new EventEmitter<string>();

  comments = signal<Comment[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  newCommentText = '';
  isSubmitting = signal(false);
  editingCommentId = signal<number | null>(null);
  editCommentText = '';

  constructor(
    private postService: PostService,
    private snackBar: MatSnackBar,
    private commentService: CommentService,
    private avatarService: AvatarService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.postId) {
      this.loadComments();
    } else {
      console.error('postId is undefined in CommentSection');
    }
  }

  async loadComments() {
    if (!this.postId) {
      console.error('Cannot load comments: postId is undefined');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const comments = await lastValueFrom(
        this.postService.getComments(this.postId)
      );

      comments.forEach(c => c.createdAt = new Date(c.createdAt));
      this.comments.set(comments);

      comments.forEach(comment => {
        if (comment.user.avatarUrl) {
          this.avatarService.loadAvatar(comment.user.userId).subscribe();
        }
      });
    } catch (err) {
      this.error.set('Не удалось загрузить комментарии');
      this.showError('Не удалось загрузить комментарии');
      this.comments.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  getAvatarUrl(userId: string): string | SafeUrl {
    return this.avatarService.getAvatarUrl(userId);
  }

  async addComment() {
    if (!this.newCommentText.trim() || this.isSubmitting() || !this.postId) return;

    const commentText = this.newCommentText;
    this.newCommentText = '';
    this.isSubmitting.set(true);

    try {
      const newComment = await lastValueFrom(
        this.postService.addComment(this.postId, commentText)
      );

      newComment.createdAt = new Date(newComment.createdAt);
      this.comments.update(comments => [newComment, ...comments]);
      this.commentAdded.emit(commentText);
    } catch (err) {
      this.showError('Не удалось добавить комментарий');
      this.newCommentText = commentText;
    } finally {
      this.isSubmitting.set(false);
    }
  }

  isCommentAuthor(comment: Comment): boolean {
    return comment.user.userId === this.authService.currentUser()?.userId;
  }

  isEditingComment(comment: Comment): boolean {
    return this.editingCommentId() === comment.id;
  }

  toggleEditComment(comment: Comment): void {
    if (this.isEditingComment(comment)) {
      this.cancelEditComment();
    } else {
      this.editCommentText = comment.text;
      this.editingCommentId.set(comment.id!);
    }
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentText = '';
  }

  async saveEditComment(comment: Comment): Promise<void> {
    if (!this.editCommentText.trim() || !comment.id) {
      this.showError('Не удалось обновить комментарий: неверный ID комментария');
      return;
    }
    try {
      const updatedComment = await lastValueFrom(this.commentService.updateComment(comment.id, { text: this.editCommentText })) as unknown as Comment;
      this.comments.update(comments => comments.map(c => c.id === comment.id ? updatedComment : c));
      this.cancelEditComment();
      this.showError('Комментарий успешно обновлен');
    } catch (error) {
      console.error('Error updating comment:', error);
      this.showError('Не удалось обновить комментарий');
    }
  }

  async deleteComment(comment: Comment): Promise<void> {
    if (!comment.id) {
      this.showError('Не удалось удалить комментарий: неверный ID комментария');
      return;
    }
    try {
      await lastValueFrom(this.commentService.deleteComment(comment.id));
      this.comments.update(comments => comments.filter(c => c.id !== comment.id));
    } catch (error) {
      console.error('Error deleting comment:', error);
      this.showError('Не удалось удалить комментарий');
    }
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
