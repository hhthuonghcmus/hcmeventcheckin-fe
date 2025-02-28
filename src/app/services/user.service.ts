import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { CookieService } from 'ngx-cookie-service';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiReponse } from '../interfaces/api-response.interface';
import { LOGGEDIN_USER_KEY } from '../constants/cookie.constant';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public qrImageLink$: BehaviorSubject<string> = new BehaviorSubject<string>(
    ''
  );

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService
  ) {}

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
    this.cookieService.delete(LOGGEDIN_USER_KEY);

    return this.httpClient.get<ApiReponse>(API_BASE_URL + 'user/sign-out');
  }

  getLoggedInUser() {
    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    if (userCookie) {
      const user = JSON.parse(userCookie) as User;
      return user;
    }

    return null;
  }
}
