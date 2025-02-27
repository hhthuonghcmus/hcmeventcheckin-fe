import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { CookieService } from 'ngx-cookie-service';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiReponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public loggedInUser$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public qrImageLink$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private httpClient: HttpClient, private cookieService: CookieService) {}

  signUp(data: any) {
    return this.httpClient.post<ApiReponse>(API_BASE_URL + 'user/sign-up', data);
  }

  logIn(data: any) {
    return this.httpClient.post<ApiReponse>(API_BASE_URL + 'user/log-in', data);
  }

  getQrCodePngImageLink() {
    return this.httpClient.get<ApiReponse>(API_BASE_URL + 'user/get-qr-code-png-image-link');
  }
}
