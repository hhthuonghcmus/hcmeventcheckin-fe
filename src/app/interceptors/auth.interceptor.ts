import { AppService } from './../services/app.service';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { LOGGEDIN_USER_KEY } from '../constants/cookie.constant';
import { User } from '../interfaces/user.interface';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private cookieService: CookieService,
    private appService: AppService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.appService.isLoading$.next(true);

    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    if (userCookie) {
      const user = JSON.parse(userCookie) as User;
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + user.accessToken),
      });
    }

    return next.handle(req).pipe(
      finalize(() => {
        this.appService.isLoading$.next(false);
      })
    );
  }
}
