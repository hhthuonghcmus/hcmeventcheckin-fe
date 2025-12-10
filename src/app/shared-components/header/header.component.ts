import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import {
  NgxScannerQrcodeComponent,
  ScannerQRCodeResult,
} from 'ngx-scanner-qrcode';
import { EventService } from '../../services/event.service';
import { FloatLabel } from 'primeng/floatlabel';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { CookieService } from 'ngx-cookie-service';
import {
  USER_FULL_NAME,
  USER_LUCKY_DRAW_CODE,
  USER_PARTICIPATED_EVENT_PIN,
  USER_PHONE_NUMBER,
} from '../../constants/cookie.constant';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    Avatar,
    Menu,
    Menubar,
    Dialog,
    ImageModule,
    RouterLink,
    FloatLabel,
    InputText,
    NgxScannerQrcodeComponent,
    FormsModule,
    ButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  navbarMenuItems: MenuItem[] = [];
  loggedInUser$: Observable<User>;
  isLoggedIn: boolean;
  isQRCodeScannerDialogVisible = false;
  isEventPINDialogVisible = false;
  isCheckInSuccessDialogVisible = false; // Add this new property
  checkInMessage = ''; // Add this to store the message
  isReceivedPrizeDialogVisible = false;
  pendingCheckInData: any = null; // Store QR code data for confirmation
  userMenuItems: MenuItem[] = [];
  isScanQrInCooldown = false;
  scanQrCooldownTime = 3000;
  publicEventPIN: string;
  publicEventPhoneNumber: string;
  participateEventForm: FormGroup;
  selectedDevice: MediaDeviceInfo = null;
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;
  selectedDeviceId: string;
  isScannerStarted = false;

  constructor(
    private cookieService: CookieService,
    private userService: UserService,
    private eventService: EventService,
    private messageService: MessageService,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.loggedInUser$ = this.userService.loggedInUser$.asObservable();

    this.userMenuItems = [
      // {
      //   label: 'Settings',
      //   icon: 'pi pi-cog',
      //   routerLink: 'settings',
      // },
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
            icon: 'pi pi-check-square',
            routerLink: 'topic/my-topics',
          },
        ];

        this.userMenuItems = [
          // {
          //   label: 'Settings',
          //   icon: 'pi pi-cog',
          //   routerLink: 'settings',
          // },
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
      } else {
        // this.navbarMenuItems = [
        //   ...this.navbarMenuItems,
        //   {
        //     label: 'Voting',
        //     icon: 'pi pi-pen-to-square',
        //     routerLink: 'voting',
        //   },
        // ];
      }
    });

    this.participateEventForm = this.formBuilder.group({
      pin: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^\d+$/),
        ],
      ],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{10,11}$/)],
      ],
      // fullName: [
      //   '',
      //   [
      //     Validators.required,
      //     Validators.maxLength(100),
      //     Validators.pattern(/^[a-zA-ZÀ-ỹ\s\-']+$/),
      //   ],
      // ],
    });

    // Listen for participate dialog event
    window.addEventListener('showParticipateDialog', () => {
      this.showParticipateEventPINDialog();
    });

    // Get PIN from URL query parameter
    this.activatedRoute.queryParams.subscribe((params) => {
      const pin = params['pin'];
      if (pin) {
        this.participateEventForm.patchValue({ pin: pin });
        this.showParticipateEventPINDialog();
      }
    });
  }

  showQrScanDialog() {
    if (this.isScannerStarted) {
      this.scanner.playDevice(this.selectedDeviceId).subscribe({
        next: () => {
          this.isQRCodeScannerDialogVisible = true;
        },
      });
    } else {
      this.scanner.start().subscribe((x) => {
        this.scanner.devices.subscribe((scannerDevices: MediaDeviceInfo[]) => {
          if (!scannerDevices || scannerDevices.length === 0) {
            alert('No cameras found on this device.');
            return;
          }

          const preferredDevice =
            scannerDevices.find((d) =>
              /back|trás|rear|traseira|environment|ambiente/gi.test(d.label)
            ) ?? scannerDevices[0];

          if (preferredDevice) {
            setTimeout(() => {
              this.selectedDeviceId = preferredDevice.deviceId;
              this.scanner.playDevice(this.selectedDeviceId).subscribe({
                next: () => {
                  this.isScannerStarted = true;

                  setTimeout(() => {
                    this.isQRCodeScannerDialogVisible = true;
                  }, 1000);
                },
              });
            });
          } else {
            alert('No suitable camera device found.');
          }
        });
      });
    }
  }

  closeQRCodeScannerDialog() {
    this.scanner.stop();
    this.isQRCodeScannerDialogVisible = false;
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

  scanPrivateEventQrCode(qrCodeResult: ScannerQRCodeResult[]) {
    if (this.isScanQrInCooldown) {
      return;
    }

    this.isScanQrInCooldown = true;
    setTimeout(() => {
      this.isScanQrInCooldown = false;
    }, this.scanQrCooldownTime);

    this.pendingCheckInData = JSON.parse(qrCodeResult[0].value);

    this.eventService.checkinPrivateEvent(this.pendingCheckInData).subscribe({
      next: (response: ApiResponse) => {
        // Close the QR scanner dialog
        this.closeQRCodeScannerDialog();

        if (response.statusCode === 200 && response.data) {
          // Check if already checked in
          if (response.data['isCheckInSecondTime'] && response.data['receivedPrize'] == false) {
            if (response.data['luckyDrawCode']) {
              this.checkInMessage = 'Name: ' + response.data['name']
              + '\nID: ' + '721890'
              + '\nPresent: ' + response.data['luckyDrawCode'];
            }
            this.isReceivedPrizeDialogVisible = true;
            this.isCheckInSuccessDialogVisible = true;
          } else if (response.data['checkedIn']) {
            // Show success dialog for new check-in
            this.checkInMessage = response.data['name'] + ' are checked in';
            this.isReceivedPrizeDialogVisible = false;
            this.isCheckInSuccessDialogVisible = true;
          }
        } else {
          this.checkInMessage = response.message;
          this.isReceivedPrizeDialogVisible = false;
          this.isCheckInSuccessDialogVisible = true;
        }
      },
      error: (error) => {
        this.checkInMessage = 'QR Code is not valid';
        this.isReceivedPrizeDialogVisible = false;
        this.isCheckInSuccessDialogVisible = true;
      },
    });
  }

  closeCheckInDialog() {
    this.isCheckInSuccessDialogVisible = false;
    this.pendingCheckInData = null;
  }

  confirmReceivePresent() {
    this.eventService.receivePrizeEvent(this.pendingCheckInData).subscribe({
      next: (response: ApiResponse) => {
        if (response.statusCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Confirmed',
            detail: 'Present received confirmed',
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
          detail: 'Failed to confirm present receipt',
        });
      },
    });
    this.closeCheckInDialog();
  }

  showParticipateEventPINDialog() {
    this.isEventPINDialogVisible = true;
  }

  participateEvent() {
    if (this.participateEventForm.valid) {
      this.eventService
        .participateEvent(this.participateEventForm.value)
        .subscribe({
          next: (response) => {
            if (response['statusCode'] === 200) {
              this.messageService.add({
                severity: 'success',
                summary: 'Participate event',
                detail: response.message,
              });

              const expiresDate = new Date();
              expiresDate.setDate(expiresDate.getDate() + 1);
              // this.cookieService.set(
              //   USER_PARTICIPATED_EVENT_PIN,
              //   this.participateEventForm.value['pin'],
              //   expiresDate
              // );
              // this.cookieService.set(
              //   USER_PHONE_NUMBER,
              //   this.participateEventForm.value['phoneNumber'],
              //   expiresDate
              // );
              // this.cookieService.set(
              //   USER_FULL_NAME,
              //   this.participateEventForm.value['fullName'],
              //   expiresDate
              // );

              // Get luckyDrawCode from response
              const drawCode = response.data['luckyDrawCode'];
              // this.cookieService.set(
              //   USER_LUCKY_DRAW_CODE,
              //   drawCode,
              //   expiresDate
              // );
              this.userService.setLuckyDrawCode(drawCode);
              this.router.navigate(['/']);

              this.isEventPINDialogVisible = false;
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Participate event',
                detail: response.message,
              });
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Participate event',
              detail: error,
            });
          },
          complete: () => {},
        });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Participate event',
        detail: 'Error',
      });
    }
  }
}
