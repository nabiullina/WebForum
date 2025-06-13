import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {lastValueFrom, Observable, tap} from 'rxjs';
import {User} from '../models/models';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient,
    private authService: AuthService
  ) {}

  createUser(userData: {
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  }): Observable<any> {
    return this.http.post(`/api/users/register`, userData);
  }

  updateUser(userId: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`/api/users/${userId}`, data);
  }

  updateProfile(userData: Partial<User>): Promise<User> {
    return lastValueFrom(this.http.put<User>(`/api/users/me`, userData).pipe(
      tap(user => {
        this.authService.updateCurrentUser(user);
      })
    ));
  }


  getUser(userId: string): Observable<User> {
    return this.http.get<User>(`/api/users/${userId}`);
  }

  uploadAvatar(userId: string, file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ avatarUrl: string }>(`/api/users/me/avatar`, formData);
  }

  getAvatarUrl(userId: string): string {
    return `/api/users/${userId}/avatar`;
  }

  getAvatarAsBlob(userId: string): Observable<Blob> {
    return this.http.get(`/api/users/${userId}/avatar`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'image/*'
      })
    });
  }
}
