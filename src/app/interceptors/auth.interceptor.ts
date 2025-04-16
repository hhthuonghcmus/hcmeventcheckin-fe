import { AppService } from '../services/app.service';
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { LOGGED_IN_USER_KEY } from '../constants/cookie.constant';
import { User } from '../interfaces/user.interface';
import { SpinnerService } from '../services/spinner.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private cookieService: CookieService,
    private spinnerService: SpinnerService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.spinnerService.isLoading$.next(true);

    const userCookie = this.cookieService.get(LOGGED_IN_USER_KEY);
    if (userCookie) {
      const user = JSON.parse(userCookie) as User;
      req = req.clone({
        headers: req.headers.set('Authorization', 'Bearer ' + user.accessToken),
      });
    }

    return next.handle(req).pipe(
      finalize(() => {
        this.spinnerService.isLoading$.next(false);
      })
    );
  }
}
