import { CommonModule } from '@angular/common';
import {
  Component,
} from '@angular/core';
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

@Component({
  selector: 'app-header',
  imports: [CommonModule, Avatar, Menu, Menubar, Button, Dialog, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  appMenuItems: MenuItem[] = [];
  loggedInUser$: Observable<User>;
  isLoggedIn: boolean;
  isQRCodeDialogVisible = false;
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
        label: 'Get QR Code',
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
            label: 'My Topics',
            icon: 'pi pi-list',
            routerLink: 'topic/my-topics',
          },
        ];
      }
    });
  }

  getQrCodePngImageLink() {
    this.isQRCodeDialogVisible = true;
    this.qrCodePngImageLink$ = this.userService.getQrCodePngImageLink();
  }

  signOut() {
    this.userService.signOut().subscribe({
      next: (response) => {
        this.userService.loggedInUser$.next(null);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.userService.loggedInUser$.next(null);
        this.router.navigate(['/']);
      },
    });
  }
}
