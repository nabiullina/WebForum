import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {NotificationService} from '../../services/notification.service';
import {UserService} from '../../services/user.service';
import {User} from '../../models/models';
import {CommonModule} from '@angular/common';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {MatSpinner} from '@angular/material/progress-spinner';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatSelectModule,
    MatSpinner,
    RouterModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  user: User | null = null;
  isLoading = false;
  isUploading = false;
  profileForm;
  defaultAvatarUrl = 'assets/images/default-avatar.png';
  avatarUrl: SafeUrl | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private notification: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.profileForm = this.fb.group({
      nickname: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      bio: ['']
    });
  }

  ngOnInit() {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.user = currentUser;
      this.profileForm.patchValue({
        nickname: currentUser.nickname,
        email: currentUser.email || '',
        bio: currentUser.bio || ''
      });
      this.loadAvatar(currentUser.userId);
    }
  }

  loadAvatar(userId: string) {
    if (this.user?.avatarUrl) {
      this.userService.getAvatarAsBlob(userId).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.avatarUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        },
        error: (err) => {
          console.error('Ошибка загрузки аватарки:', err);
          this.avatarUrl = null;
        }
      });
    }
  }

  getAvatarUrl(): string | SafeUrl {
    if (this.avatarUrl) {
      return this.avatarUrl;
    }
    return this.defaultAvatarUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.notification.showError('Пожалуйста, выберите изображение');
        return;
      }

      this.isUploading = true;

      this.userService.uploadAvatar(this.user!.userId, file).subscribe({
        next: (response) => {
          if (this.user) {
            this.user.avatarUrl = response.avatarUrl;
            this.authService.updateCurrentUser(this.user);
            this.loadAvatar(this.user.userId);
          }
          this.notification.showSuccess('Аватар успешно обновлен');
          this.isUploading = false;
        },
        error: (err) => {
          this.notification.showError(err.message || 'Ошибка загрузки аватара');
          this.isUploading = false;
        }
      });
    }
  }

  async onSubmit() {
    if (this.profileForm.invalid || !this.user) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const formData = {
      ...this.user,
      nickname: this.profileForm.value.nickname!,
      email: this.profileForm.value.email!,
      bio: this.profileForm.value.bio!
    };

    try {
    const updatedUser = await this.userService.updateProfile(formData);
this.notification.showSuccess('Профиль успешно обновлен');
        this.router.navigate(['/profile']);
      this.user = updatedUser;
    } catch (error) {
      console.error('Error updating profile:', error);
    }

  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }
}
