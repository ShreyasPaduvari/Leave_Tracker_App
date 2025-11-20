import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private apiUrl = 'http://localhost:3001/leaves';
  constructor(private http: HttpClient) {}

  getLeaves(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  applyLeave(leave: any): Observable<any> {
    return this.http.post(this.apiUrl, leave);
  }

  updateLeave(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status });
  }
}
