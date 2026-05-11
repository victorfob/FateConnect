// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Login, TokenResponse } from '../models/login.model';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(dto: Login): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login`, dto).pipe(
      tap((response) => this.setSession(response))
    );
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
  }

  // Criar uma token.service para lidar melhor com isso. Talvez seja melhor.
  // Vai precisar configurar para interceptar as requisições e adicionar o token no header.
  private setSession(authResult: TokenResponse): void {
    localStorage.setItem('jwt_token', authResult.token);
    localStorage.setItem('user_name', authResult.nomeCompleto);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
}
