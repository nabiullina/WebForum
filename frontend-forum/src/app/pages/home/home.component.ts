import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PostComponent} from '../../components/post/post.component';
import {Category, SidebarComponent} from '../../components/sidebar/sidebar.component';
import {PostService} from '../../services/post.service';
import {MediaService} from '../../services/media.service';
import {firstValueFrom} from 'rxjs';
import {Post, User} from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PostComponent,
    SidebarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  posts = signal<Post[]>([]);
  categories = signal<Category[]>([]);
  currentCategory = signal<number | null>(null);
  selectedUser = signal<User | null>(null);
  newPostContent = '';
  selectedFiles = signal<File[]>([]);
  isLoading = signal(false);

  constructor(
    private postService: PostService,
    public mediaService: MediaService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCategories().then(() => {
      this.loadPosts();
    });
  }

  async loadPosts() {
    this.isLoading.set(true);
    try {
      const posts = await this.postService.getPosts(0, 0, this.currentCategory() || undefined);
      this.posts.set(posts);
    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('Не удалось загрузить посты');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCategories() {
    try {
      const categories = await firstValueFrom(this.postService.getCategories());
      this.categories.set(categories);

      if (!this.currentCategory() && categories.length > 0) {
        this.currentCategory.set(categories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.showError('Не удалось загрузить категории');
    }
  }

  onCategorySelected(categoryId: number) {
    this.currentCategory.set(categoryId);
    this.loadPosts();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const validFiles = files.filter(file => 
        this.mediaService.isImageFile(file) || this.mediaService.isVideoFile(file)
      );
      
      if (validFiles.length !== files.length) {
        this.showError('Некоторые файлы не поддерживаются. Поддерживаются только изображения и видео.');
      }
      
      this.selectedFiles.update(current => [...current, ...validFiles]);
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  async createPost() {
    if (!this.newPostContent.trim() && this.selectedFiles().length === 0) return;

    try {
      const post = await firstValueFrom(this.postService.createPost({
        title: 'New Post',
        content: this.newPostContent,
        categoryId: this.currentCategory() || 1
      }));

      if (post) {
        if (this.selectedFiles().length > 0) {
          await firstValueFrom(this.mediaService.uploadMedia(post.id, this.selectedFiles()));
        }

        this.posts.update(posts => [post, ...posts]);
        this.newPostContent = '';
        this.selectedFiles.set([]);
        this.showSuccess('Пост успешно создан');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      this.showError('Не удалось создать пост');
    }
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  ngOnDestroy() {
    this.selectedFiles().forEach(file => {
      URL.revokeObjectURL(this.getFilePreview(file));
    });
  }
}
