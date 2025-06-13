import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, lastValueFrom, map, Observable, of, timeout} from 'rxjs';
import {Category} from '../components/sidebar/sidebar.component';
import {Comment, Like, Post} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private http: HttpClient) {}

  async getPosts(page: number, size: number, categoryId?: number): Promise<Post[]> {
    try {
      console.log('Fetching posts with params:', { page, size, categoryId });
      const url = categoryId
        ? `/api/posts/${categoryId}`
        : `/api/posts`;

      const response = await lastValueFrom(
        this.http.get<Post[]>(url).pipe(
          timeout(5000),
          catchError(error => {
            console.error('Error fetching posts:', error);
            return of(this.getFallbackPosts());
          })
        )
      );
console.log(response);
      return response;
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      return this.getFallbackPosts();
    }
  }

  private getFallbackPosts(): Post[] {
    return [{
      id: -1,
      title: 'Посты временно недоступны',
      content: 'Сервис постов в настоящее время не отвечает. Пожалуйста, попробуйте позже.',
      createdAt: new Date(),
      categoryId: 0
    }];
  }

  createPost(post: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(`/api/posts`, post).pipe(
      map(response => {
        if (post.mediaUrls && !response.mediaUrls) {
          response.mediaUrls = post.mediaUrls;
        }
        return response;
      })
    );
  }

  updatePost(postId: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`/api/posts`, { id: postId, ...post });
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`/api/likes/${postId}`, { }).pipe(
      catchError(error => {
        console.error('Error liking post:', error);
        throw error;
      })
    );
  }

  unLikePost(postId: number): Observable<any> {
    return this.http.delete(`/api/likes/${postId}`).pipe(
      catchError(error => {
        console.error('Error unliking post:', error);
        throw error;
      })
    );
  }

  addComment(postId: number, text: string): Observable<Comment> {
    console.log('Adding comment for postId:', postId, 'text:', text);
    return this.http.post<Comment>(`/api/comments`, {
      postId,
      text
    }).pipe(
      catchError(error => {
        console.error('Error adding comment:', error);
        throw error;
      })
    );
  }

  getCategories(): Observable<Category[]> {
    console.log('Fetching categories from:', `/api/categories`);
    return this.http.get<Category[]>(`/api/categories`).pipe(
      catchError(error => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  getComments(postId: number): Observable<Comment[]> {
    console.log('Getting comments for postId:', postId);
    return this.http.get<Comment[]>(`/api/comments/${postId}`).pipe(
      catchError(error => {
        console.error('Error fetching comments:', error);
        return of([]);
      })
    );
  }

  getLikes(postId: number): Observable<Like[]> {
    return this.http.get<Like[]>(`/api/likes/${postId}`).pipe(
      catchError(error => {
        console.error('Error fetching likes:', error);
        return of([]);
      })
    );
  }
}
