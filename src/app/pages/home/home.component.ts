import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { USER_PHONE_NUMBER } from '../../constants/cookie.constant';
import { EventService } from '../../services/event.service';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { Event } from '../../interfaces/event.interface';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  event: Event;
  phoneNumber: string;
  luckyDrawCode: string;
  isLoggedIn: boolean;
  constructor(
    private cookieService: CookieService,
    private eventService: EventService,
    private userService: UserService
  ) {}
  ngOnInit() {
    this.isLoggedIn = this.userService.getLoggedInUser() !== null;

    if (!this.isLoggedIn) {
      this.userService.luckyDrawCode$.subscribe((drawCode) => {
        if (drawCode) {
          this.luckyDrawCode = drawCode;
        }
      });

      console.log('This lucky draw code:', this.luckyDrawCode);

      if (!this.luckyDrawCode) {
        this.phoneNumber = this.cookieService.get(USER_PHONE_NUMBER);
        if (this.phoneNumber) {
          this.eventService
            .getParticipatedEvent(this.phoneNumber)
            .subscribe((response: ApiResponse) => {
              if (response.statusCode === 200) {
                this.event = response.data as Event;
                this.eventService
                  .getLuckyDrawCodeByPhoneNumber(
                    this.event.id,
                    this.phoneNumber
                  )
                  .subscribe((response: ApiResponse) => {
                    if (response.statusCode === 200) {
                      this.luckyDrawCode = response.data as unknown as string;
                    }
                  });
              }
            });
        }
      }
    }
  }
}
