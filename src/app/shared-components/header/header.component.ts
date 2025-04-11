import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { ApiReponse } from '../../interfaces/api-response.interface';
import { NgxScannerQrcodeComponent, LOAD_WASM } from 'ngx-scanner-qrcode';

@Component({
  selector: 'app-header',
  imports: [CommonModule, Avatar, Menu, Menubar, Button, Dialog, RouterLink, NgxScannerQrcodeComponent ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  appMenuItems: MenuItem[] = [];
  loggedInUser$: Observable<User>;
  isLoggedIn: boolean;
  isQRCodeScannerDialogVisible = false;
  userMenuItems: MenuItem[] = [];
  qrCodePngImageLink$: Observable<ApiReponse> = null;

  constructor(private userService: UserService, private router: Router) {
    this.loggedInUser$ = this.userService.loggedInUser$.asObservable();

    this.userMenuItems = [
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: 'settings',
      },
      {
        label: 'Scan private QR Code',
        icon: 'pi pi-qrcode',
        command: () => this.getQrCodePngImageLink(),
      },
      {
        label: 'Sign Out',
        icon: 'pi pi-sign-out',
        command: () => this.signOut(),
      },
    ];
  }

  ngOnInit() {
    this.userService.loggedInUser$.next(this.userService.getLoggedInUser());
    this.loggedInUser$.subscribe((loggedInUser: User) => {
      this.appMenuItems = [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: '/',
        },
      ];

      const role = this.userService.getLoggedInUserRole();
      if (role === 'Admin') {
        this.appMenuItems = [
          ...this.appMenuItems,
          {
            label: 'My Events',
            icon: 'pi pi-list',
            routerLink: 'event/my-events',
          },
          {
            label: 'My Topics',
            icon: 'pi pi-list',
            routerLink: 'topic/my-topics',
          },
        ];
      }
    });
  }

  getQrCodePngImageLink() {
    this.isQRCodeScannerDialogVisible = true;
    this.qrCodePngImageLink$ = this.userService.getQrCodePngImageLink();
  }

  signOut() {
    this.userService.signOut().subscribe({
      next: (response) => {
        this.userService.clearLoggedInUser();
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.userService.clearLoggedInUser();
        this.router.navigate(['/']);
      },
    });
  }
}
