import { Component, ElementRef, ViewChild } from '@angular/core';
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
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

@Component({
  selector: 'app-manage-event-participants',
  imports: [TableModule, ButtonModule, Dialog, CommonModule],
  templateUrl: './manage-event-participants.component.html',
  styleUrl: './manage-event-participants.component.scss',
})
export class ManageEventParticipantsComponent {
  event: Event;
  participants: Participant[];
  isQrCodeDialogVisible = false;
  qrCodeImageLink: string | null = null;
  selectedParticipant: Participant | null = null;

  // For bulk download
  isDownloadingAll = false;
  currentDownloadParticipant: Participant | null = null;
  currentDownloadQrCodeLink: string | null = null;

  @ViewChild('qrCodeContent') qrCodeContent!: ElementRef;
  @ViewChild('hiddenQrCodeContent') hiddenQrCodeContent!: ElementRef;

  constructor(
    private eventService: EventService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.event = this.eventService.getCurrentEvent();
    if (!this.event) {
      this.router.navigate(['event/my-events']);
    }
  }

  ngOnInit() {
    this.participants = this.event.participants;
  }

  async downloadAllInvitations() {
    if (!this.participants || this.participants.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Participants',
        detail: 'No participants to download invitations for.',
      });
      return;
    }

    this.isDownloadingAll = true;
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    this.messageService.add({
      severity: 'info',
      summary: 'Download Started',
      detail: `Generating ${this.participants.length} invitations. Please wait...`,
    });

    for (const participant of this.participants) {
      try {
        const imageBlob = await this.generateInvitationForParticipant(participant);
        if (imageBlob) {
          const fileName = `${participant.name.replace(/[^a-zA-Z0-9]/g, '_')}_Invitation.png`;
          zip.file(fileName, imageBlob);
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to generate invitation for ${participant.name}:`, error);
      }
    }

    if (successCount > 0) {
      try {
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${this.event.name}_All_Invitations.zip`;
        link.click();
        URL.revokeObjectURL(link.href);

        this.messageService.add({
          severity: 'success',
          summary: 'Download Complete',
          detail: `Successfully downloaded ${successCount} invitations.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`,
        });
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Download Error',
          detail: 'Failed to create ZIP file.',
        });
      }
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Download Failed',
        detail: 'Failed to generate any invitations.',
      });
    }

    this.isDownloadingAll = false;
    this.currentDownloadParticipant = null;
    this.currentDownloadQrCodeLink = null;
  }

  private generateInvitationForParticipant(participant: Participant): Promise<Blob | null> {
    return new Promise((resolve) => {
      const requestData = {
        eventId: this.event.id,
        phoneNumber: participant.phoneNumber,
        name: participant.name,
      };

      this.eventService.getPrivateQrCodePngImageLink(requestData).subscribe({
        next: async (response: ApiResponse) => {
          if (response.statusCode === 200 && response.data) {
            this.currentDownloadParticipant = participant;
            this.currentDownloadQrCodeLink = String(response.data);

            // Wait for Angular to update the view
            await new Promise(r => setTimeout(r, 100));

            // Preload the image before capturing
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            await new Promise<void>((imgResolve) => {
              img.onload = () => imgResolve();
              img.onerror = () => imgResolve();
              img.src = this.currentDownloadQrCodeLink;
            });

            // Wait a bit more for Angular to render
            await new Promise(r => setTimeout(r, 200));

            try {
              const element = this.hiddenQrCodeContent.nativeElement;
              const canvas = await html2canvas(element, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: null,
                scale: 1,
              });

              canvas.toBlob((blob) => {
                resolve(blob);
              }, 'image/png');
            } catch (error) {
              console.error('html2canvas error:', error);
              resolve(null);
            }
          } else {
            resolve(null);
          }
        },
        error: () => {
          resolve(null);
        },
      });
    });
  }

  showQrCode(phoneNumber: string, name: string) {
    if (!phoneNumber) {
      this.messageService.add({
        severity: 'error',
        summary: 'QR Code Error',
        detail: 'Phone number is required',
      });
      return;
    }

    this.selectedParticipant = this.participants.find(p => p.phoneNumber === phoneNumber);

    const requestData = {
      eventId: this.event.id,
      phoneNumber: phoneNumber,
      name: name,
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

  downloadInvitation(selectedParticipant: Participant) {
    if (!this.qrCodeContent) {
      return;
    }

    const element = this.qrCodeContent.nativeElement;

    html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 1
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${selectedParticipant?.name || 'QR_Code'}_Invitation.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch((error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Download Error',
        detail: 'Failed to download image. Please try again.',
      });
    });
  }
}
