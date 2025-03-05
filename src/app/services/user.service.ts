import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { CookieService } from 'ngx-cookie-service';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiReponse } from '../interfaces/api-response.interface';
import { LOGGEDIN_USER_KEY } from '../constants/cookie.constant';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public qrImageLink$ = new BehaviorSubject<string>('');
  public loggedInUser$ = new BehaviorSubject<User>(null);

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService
  ) {}

  getRole() {
    return this.httpClient.get<ApiReponse>(API_BASE_URL + 'user/get-role');
  }

  signUp(data: any) {
    return this.httpClient.post<ApiReponse>(
      API_BASE_URL + 'user/sign-up',
      data
    );
  }

  logIn(data: any) {
    return this.httpClient.post<ApiReponse>(API_BASE_URL + 'user/log-in', data);
  }

  getQrCodePngImageLink() {
    return this.httpClient.get<ApiReponse>(
      API_BASE_URL + 'user/get-qr-code-png-image-link'
    );
  }

  signOut() {
    return this.httpClient.get<ApiReponse>(API_BASE_URL + 'user/sign-out');
  }
 
  clearLoggedInUser() {
    this.cookieService.delete(LOGGEDIN_USER_KEY);
    this.loggedInUser$.next(null);
  }

  getLoggedInUser(): User {
    let user: User = null;
    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    if (userCookie) {
      user = JSON.parse(userCookie) as User;
    }

    return user;
  }

  getLoggedInUserRole(): string {
    let role = '';
    let user: User = null;
    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    if (userCookie) {
      user = JSON.parse(userCookie) as User;
      if (user) {
        const decodedObject = jwtDecode(user.accessToken);
        role = decodedObject['role'];
      }
    }

    return role;
  }
}
