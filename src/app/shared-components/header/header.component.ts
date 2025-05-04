import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Button, ButtonModule } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';
import { EventService } from '../../services/event.service';
import { FloatLabel } from 'primeng/floatlabel';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    Avatar,
    Menu,
    Menubar,
    Dialog,
    RouterLink,
    FloatLabel,
    InputText,
    NgxScannerQrcodeComponent,
    FormsModule,
    ButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  navbarMenuItems: MenuItem[] = [];
  loggedInUser$: Observable<User>;
  isLoggedIn: boolean;
  isQRCodeScannerDialogVisible = false;
  userMenuItems: MenuItem[] = [];
  isScanQrInCooldown = false;
  scanQrCooldownTime = 3000;
  isPublicEventPINDialogVisible = false;
  publicEventPIN: string;
  publicEventPhoneNumber: string;
  participatePublicEventForm: FormGroup;

  constructor(private userService: UserService, private eventService: EventService, private messageService: MessageService, private router: Router, private formBuilder: FormBuilder) {
    this.loggedInUser$ = this.userService.loggedInUser$.asObservable();

    this.userMenuItems = [
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: 'settings',
      },
      {
        label: 'Participate public event',
        icon: 'pi pi-user-plus',
        command: () => this.showPublicEventPINDialog(),
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
      this.navbarMenuItems = [
        {
          label: 'Home',
          icon: 'pi pi-home',
          routerLink: '/',
        },
      ];

      const role = this.userService.getLoggedInUserRole();
      if (role === 'Admin') {
        this.navbarMenuItems = [
          ...this.navbarMenuItems,
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

        this.userMenuItems = [
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: 'settings',
          },
          {
            label: 'Participate public event',
            icon: 'pi pi-user-plus',
            command: () => this.showPublicEventPINDialog(),
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
    });

    this.participatePublicEventForm = this.formBuilder.group({
      pin: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d+$/)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,11}$/)],
      ],
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

  showPublicEventPINDialog() {
    this.isPublicEventPINDialogVisible = true;
  }

  participatePublicEvent() {
    console.log(this.participatePublicEventForm.value)
    if (this.participatePublicEventForm.valid) {
      this.eventService.participatePrivateEvent(this.participatePublicEventForm.value).subscribe({
        next: (response) => {
          if (response['statusCode'] === 200) {
            this.messageService.add({
              severity: 'error',
              summary: 'Participate public event',
              detail: 'Successful',
            });
          } else {

          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Participate public event',
            detail: 'Error',
          });
        },
        complete: () => { },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Participate public event',
        detail: 'Error',
      });
    }

  }
}
