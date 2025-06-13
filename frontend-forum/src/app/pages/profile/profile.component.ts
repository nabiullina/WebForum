import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {User} from '../../models/models';
import {AvatarService} from '../../services/avatar.service';
import {SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RouterLink
    ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  isLoading = signal(false);
  isEditing = signal(false);

  nickname = '';
  email = '';
  bio = '';
  avatarUrl = '';

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private avatarService: AvatarService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    this.isLoading.set(true);
    try {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.user.set(currentUser);
        this.nickname = currentUser.nickname;
        this.email = currentUser.email || '';
        this.bio = currentUser.bio || '';
        this.avatarUrl = currentUser.avatarUrl || '';

        if (currentUser.avatarUrl) {
          this.avatarService.loadAvatar(currentUser.userId).subscribe();
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.showError('Не удалось загрузить профиль');
    } finally {
      this.isLoading.set(false);
    }
  }

  getAvatarUrl(userId: string): string | SafeUrl {
    return this.avatarService.getAvatarUrl(userId);
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Закрыть', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}
