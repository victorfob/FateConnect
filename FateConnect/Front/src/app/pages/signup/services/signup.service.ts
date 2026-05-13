import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { User, UserResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SignupService {
  private readonly http = inject(HttpClient);
  private readonly signupUrl = `${environment.apiUrl}/usuario`;

  signup(dto: User): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.signupUrl}/cadastro`, dto);
  }
}
