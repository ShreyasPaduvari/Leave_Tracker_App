import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USERS_URL = 'http://localhost:3000/users'; // ✅ correct path

  constructor(private http: HttpClient) {}

  // Get all users
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.USERS_URL);
  }

  // Signup (POST)
  signup(user: any): Observable<any> {
    return this.http.post(this.USERS_URL, user);
  }
}
