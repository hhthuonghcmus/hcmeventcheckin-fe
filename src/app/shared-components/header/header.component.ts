import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Router, RouterLink } from '@angular/router';
import { LOGGEDIN_USER_KEY } from '../../constants/cookie.constant';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../../interfaces/user.interface';
import { ApiReponse } from '../../interfaces/api-response.interface';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, Avatar, Menu, Menubar, Button, Dialog, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  appMenuItems: MenuItem[] = [];
  loggedInUser$: Observable<User>;
  isQRCodeDialogVisible = false;
  userMenuItems: MenuItem[] = [];
  qrCodePngImageLink$: Observable<ApiReponse>;
  isLoading = true;
  
  constructor(
    private cookieService: CookieService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.appMenuItems = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        routerLink: '/',
      },
    ];

    this.userMenuItems = [
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: '/settings',
      },
      {
        label: 'Get QR Code',
        icon: 'pi pi-qrcode',
        command: () => this.getQrCodePngImageLink(),
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => this.logOut(),
      },
    ];

    this.loggedInUser$ = this.userService.loggedInUser$.asObservable();
  }

  getQrCodePngImageLink() {
    this.isQRCodeDialogVisible = true;
    this.qrCodePngImageLink$ = this.userService.getQrCodePngImageLink();
  }

  logOut() {
    this.cookieService.delete(LOGGEDIN_USER_KEY);
    this.userService.loggedInUser$.next(null);
    this.router.navigate['/'];
  }

  isLoggedIn() {
    const userCookie = this.cookieService.get(LOGGEDIN_USER_KEY);
    this.isLoading = false;
    if (!userCookie) {
      return false;
    }

    const user = JSON.parse(userCookie);
    if (user) {
      this.userService.loggedInUser$.next(user);
      return true;
    }

    return false;
  }
}
