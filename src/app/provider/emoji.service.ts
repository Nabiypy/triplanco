import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EmojiService {
  constructor(private http: HttpClient) {}

  private URL = 'https://api.github.com/emojis';

  getEmojis(): Observable<Object> {
    return this.http.get<Object>(this.URL).pipe(catchError(this.handleError()));
  }
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}