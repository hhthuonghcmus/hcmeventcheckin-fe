import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { LOGGEDIN_USER_KEY } from '../constants/localStorage.constants';
import { User } from '../interfaces/user.interface';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    if (userCookie) {
      const user = JSON.parse(userCookie) as User;
      console.log(user.accessToken);
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + user.accessToken)
      });
    }

    return next.handle(req).pipe();
  }
}
