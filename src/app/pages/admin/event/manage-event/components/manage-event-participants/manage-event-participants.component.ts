import { Component } from '@angular/core';
import { Participant } from '../../../../../../interfaces/participant.interface';
import { Event } from '../../../../../../interfaces/event.interface';
import { EventService } from '../../../../../../services/event.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button, ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ApiResponse } from '../../../../../../interfaces/api-response.interface';
import { Dialog } from 'primeng/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-event-participants',
  imports: [TableModule, ButtonModule, Dialog, CommonModule],
  templateUrl: './manage-event-participants.component.html',
  styleUrl: './manage-event-participants.component.scss'
})
export class ManageEventParticipantsComponent {
  event: Event;
  participants: Participant[];
  isQrCodeDialogVisible = false;
  qrCodeImageLink: string | null = null;

  constructor(private eventService: EventService, private router: Router, private messageService: MessageService) {
    this.event = this.eventService.getCurrentEvent();
    if (!this.event) {
      this.router.navigate(['event/my-events'])
    }
  }

  ngOnInit() {
    this.participants = this.event.participants;
  }

  showQrCode(phoneNumber: string) {
      if (!phoneNumber) {
        this.messageService.add({
          severity: 'error',
          summary: 'QR Code Error',
          detail: 'Phone number is required',
        });
        return;
      }
      const requestData = {
        eventId: this.event.id,
        phoneNumber: phoneNumber,
      };
  
      this.eventService.getPrivateQrCodePngImageLink(requestData).subscribe({
        next: (response: ApiResponse) => {
          if (response.statusCode === 200 && response.data) {
            this.qrCodeImageLink = String(response.data);
            this.isQrCodeDialogVisible = true;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'QR Code Error',
              detail: response.message || 'Failed to generate QR code',
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'QR Code Error',
            detail: 'Failed to generate QR code. Please try again.',
          });
        },
      });
    }

    
}
