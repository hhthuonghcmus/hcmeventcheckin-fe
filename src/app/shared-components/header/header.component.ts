import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Button } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { NgxScannerQrcodeComponent, LOAD_WASM, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    Avatar,
    Menu,
    Menubar,
    Button,
    Dialog,
    RouterLink,
    NgxScannerQrcodeComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  appMenuItems: MenuItem[] = [];
  loggedInUser$: Observable<User>;
  isLoggedIn: boolean;
  isQRCodeScannerDialogVisible = false;
  userMenuItems: MenuItem[] = [];
  isScanQrInCooldown = false;
  scanQrCooldownTime = 3000;

  constructor(private userService: UserService, private eventService: EventService, private messageService: MessageService, private router: Router) {
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
        command: () => this.showQrScanDialog(),
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

  showQrScanDialog() {
    this.isQRCodeScannerDialogVisible = true;
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

  scanQrCode(qrCodeResult: ScannerQRCodeResult[]) {
    if (this.isScanQrInCooldown) {
      return;
    }

    this.isScanQrInCooldown = true;
    setTimeout(() => {
      this.isScanQrInCooldown = false;
    }, this.scanQrCooldownTime);

    this.eventService.participatePrivateEvent(JSON.parse(qrCodeResult[0].value)).subscribe({
      next: (response: ApiResponse) => {
        if (response.statusCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Check in',
            detail: 'Successful',
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message,
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: "Qr Code is not valid",
        });
      },
    });
  }
}
