import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
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
  loggedInUser: User;
  isLoggedIn: boolean;
  isQRCodeDialogVisible = false;
  userMenuItems: MenuItem[] = [];
  qrCodePngImageLink$: Observable<ApiReponse> = null;

  constructor(private userService: UserService, private router: Router, private cdRef: ChangeDetectorRef) {
   
  }

  ngOnInit() {
    this.loggedInUser = this.userService.getLoggedInUser();
    if (this.loggedInUser !== null) {
      this.isLoggedIn = true;
      this.cdRef.detectChanges()
    }
    else {
      this.isLoggedIn = false;
    }
    
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
        command: () => this.signOut(),
      },
    ];
  }

  getQrCodePngImageLink() {
    this.isQRCodeDialogVisible = true;
    this.qrCodePngImageLink$ = this.userService.getQrCodePngImageLink();
  }

  signOut() {
    this.userService.signOut().subscribe({
      next: (response) => {
        window.location.href = '/'; 
      },
      error: (error) => {
        window.location.href = '/'; 
      },
    });
  }
}
