import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  USER_PARTICIPATED_EVENT_PIN,
} from '../../constants/cookie.constant';
import { EventService } from '../../services/event.service';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { Event } from '../../interfaces/event.interface';
import { Participant } from '../../interfaces/participant.interface';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    Dialog,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  event: Event;
  participant: Participant;
  showParticipateInfo = false;
  isLoggedIn: boolean;
  isEventPINDialogVisible = false;
  participateEventForm: FormGroup;

  constructor(
    private cookieService: CookieService,
    private eventService: EventService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit() {
    this.isLoggedIn = this.userService.getLoggedInUser() !== null;

    // Initialize form
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
      companyEmail: ['', [
        Validators.required,
        Validators.email
      ]],
      personalId: [
        '',
        [
          Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });

    // Get PIN from URL query parameter
    this.activatedRoute.queryParams.subscribe((params) => {
      const pin = params['pin'];
      if (pin) {
        this.participateEventForm.patchValue({ pin: pin });
      }
    });
  }

  showParticipateDialog() {
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
              this.cookieService.set(
                USER_PARTICIPATED_EVENT_PIN,
                this.participateEventForm.value['pin'],
                expiresDate
              );

              // Get luckyDrawCode from response
              this.participant = response.data as Participant;
              if (this.participant) {
                this.showParticipateInfo = true;
              }
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
        });
    }
  }
}
