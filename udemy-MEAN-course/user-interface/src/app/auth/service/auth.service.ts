import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  private tokenTimer: any;
  private userToken: string;
  private authStatus = new Subject<boolean>();
  private isUserAuthenticated = false;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http.post('http://localhost:3000/api/user/signup', authData, this.httpOptions).subscribe(res => {
      console.log(res);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number }>('http://localhost:3000/api/user/login', authData, this.httpOptions)
      .subscribe(res => {
        this.userToken = res.token;
        if (this.userToken) {
          const expiresIn = res.expiresIn;
          this.setAuthTimer(expiresIn);
          this.authStatus.next(true);
          this.isUserAuthenticated = true;
          const expDate = new Date(new Date().getTime() + expiresIn * 1000);
          this.saveAuthToken(this.userToken, expDate);
          this.router.navigate(['/']);
        }
      });
  }

  autoAuthUser() {
    const authData = this.getAuthToken();
    if (!authData) {
      this.logout();
    }
    const expiresIn = authData.expirationDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.userToken = authData.token;
      this.isUserAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatus.next(true);
    }
  }

  getToken() {
    return this.userToken;
  }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }

  getIsUserAuthenticated() {
    return this.isUserAuthenticated;
  }

  logout() {
    this.userToken = null;
    this.isUserAuthenticated = false;
    this.authStatus.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthToken();
    this.router.navigate(['/']);
  }

  private saveAuthToken(token: string, expirationDate: Date) {
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }

  private clearAuthToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
  }

  private getAuthToken() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    if (!token || !expirationDate) {
      return null;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
    };
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
