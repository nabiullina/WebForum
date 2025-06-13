import {Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {BehaviorSubject, catchError, filter, Observable, tap, throwError} from 'rxjs';
import {NotificationService} from './notification.service';
import {environment} from '../../environments/environment';
import {User} from '../models/models';

interface TokenData {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in?: number;
    token_type: 'Bearer';
  }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router,
    private notification: NotificationService
  ) {
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private clearToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`/api/users/me`).pipe(
      tap(user => {
        console.log(user);
        this.currentUserSignal.set(user);
      })
    );
  }
  private readonly authUrl = `${environment.keycloakUrl}/realms/${environment.realm}/protocol/openid-connect/token`;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;

  login(username: string, password: string) {
          const body = new URLSearchParams();
          body.set('client_id', environment.clientId);
          body.set('client_secret', environment.clientSecret);
          body.set('grant_type', 'password');
          body.set('username', username);
          body.set('password', password);

          const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
          });

    return this.http.post<TokenData>(this.authUrl, body.toString(), { headers }).pipe(
        tap((tokenData) => {
          console.log('TokenData from server:', tokenData);
        this.storeTokens(tokenData);
          this.fetchCurrentUser();
          this.router.navigate(['/']);
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  refreshAccessToken() {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(filter(token => token !== null));
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return throwError(() => 'No refresh token');
    }

    const body = new URLSearchParams();
    body.set('client_id', environment.clientId);
    body.set('client_secret', environment.clientSecret);
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', refreshToken);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<TokenData>(this.authUrl, body.toString(), { headers }).pipe(
      tap((tokenData) => {
        this.storeTokens(tokenData);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(tokenData.access_token);
      }),
      catchError((error) => {
        this.isRefreshing = false;
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
    this.notification.showInfo('Вы вышли из системы');
  }

  updateCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSignal() && !!this.getToken();
  }

  private storeTokens(tokenData: TokenData) {
    localStorage.setItem('access_token', tokenData.access_token);
    localStorage.setItem('refresh_token', tokenData.refresh_token);
    localStorage.setItem('token_expires_at', (Date.now() + tokenData.expires_in * 1000).toString());
  }
}
