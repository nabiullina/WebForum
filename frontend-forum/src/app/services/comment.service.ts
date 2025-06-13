import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  constructor(private http: HttpClient) {}

  getComments(postId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/posts/${postId}/comments`);
  }

  addComment(postId: string, text: string): Observable<any> {
    return this.http.post<any>(`/api/posts/${postId}/comments`, { text });
  }

  updateComment(commentId: number | undefined, comment: { text: string }): Observable<Comment> {
    if (!commentId) throw new Error('Comment ID is required');
    console.log('Updating comment:', { commentId, comment });
    const url = `/api/comments/${commentId}`;
    console.log('Update URL:', url);
    return this.http.put<Comment>(url, comment);
  }

  deleteComment(commentId: number | undefined): Observable<void> {
    if (!commentId) throw new Error('Comment ID is required');
    console.log('Deleting comment:', { commentId });
    const url = `/api/comments/${commentId}`;
    console.log('Delete URL:', url);
    return this.http.delete<void>(url);
  }
}
