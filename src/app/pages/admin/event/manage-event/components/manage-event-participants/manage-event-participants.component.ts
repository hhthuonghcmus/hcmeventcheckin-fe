import { Component, ElementRef, ViewChild, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { MessageService } from 'primeng/api';

import html2canvas from 'html2canvas';
import JSZip from 'jszip';

import { Participant } from '../../../../../../interfaces/participant.interface';
import { Event } from '../../../../../../interfaces/event.interface';
import { EventService } from '../../../../../../services/event.service';
import { ApiResponse } from '../../../../../../interfaces/api-response.interface';

const RENDER_DELAY_MS = 100;
const IMAGE_LOAD_DELAY_MS = 200;

@Component({
  selector: 'app-manage-event-participants',
  imports: [TableModule, ButtonModule, Dialog, CommonModule],
  templateUrl: './manage-event-participants.component.html',
  styleUrl: './manage-event-participants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageEventParticipantsComponent implements OnInit {
  event: Event;
  participants: Participant[] = [];
  isQrCodeDialogVisible = false;
  qrCodeImageLink: string | null = null;
  selectedParticipant: Participant | null = null;
  isDownloadingAll = false;
  compressedItems = 0;
  currentDownloadParticipant: Participant | null = null;
  currentDownloadQrCodeLink: string | null = null;

  @ViewChild('qrCodeContent') qrCodeContent!: ElementRef<HTMLElement>;
  @ViewChild('hiddenQrCodeContent') hiddenQrCodeContent!: ElementRef<HTMLElement>;

  constructor(
    private eventService: EventService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.event = this.eventService.getCurrentEvent();
    if (!this.event) {
      this.router.navigate(['event/my-events']);
    }
  }

  ngOnInit(): void {
    this.participants = this.event?.participants ?? [];
  }

  trackByPhoneNumber(_index: number, participant: Participant): string {
    return participant.phoneNumber;
  }

  async downloadAllInvitations(): Promise<void> {
    if (!this.participants?.length) {
      this.showMessage('warn', 'No Participants', 'No participants to download invitations for.');
      return;
    }

    this.isDownloadingAll = true;
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    this.showMessage('info', 'Download Started', `Generating ${this.participants.length} invitations. Please wait...`);

    for (const participant of this.participants) {
      try {
        const imageBlob = await this.generateInvitationForParticipant(participant);
        if (imageBlob) {
          const fileName = this.sanitizeFileName(participant.name);
          zip.file(fileName, imageBlob);
          successCount++;
          this.compressedItems = successCount;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to generate invitation for ${participant.name}:`, error);
      }
      this.cdr.markForCheck();
    }

    await this.finalizeDownload(zip, successCount, errorCount);
    this.cdr.markForCheck();
  }

  showQrCode(phoneNumber: string, name: string): void {
    if (!phoneNumber) {
      this.showMessage('error', 'QR Code Error', 'Phone number is required');
      return;
    }

    this.selectedParticipant = this.participants.find(p => p.phoneNumber === phoneNumber) ?? null;

    const requestData = { eventId: this.event.id, phoneNumber, name };

    this.eventService.getPrivateQrCodePngImageLink(requestData).subscribe({
      next: (response: ApiResponse) => {
        if (response.statusCode === 200 && response.data) {
          this.qrCodeImageLink = String(response.data);
          this.isQrCodeDialogVisible = true;
        } else {
          this.showMessage('error', 'QR Code Error', response.message || 'Failed to generate QR code');
        }
        this.cdr.markForCheck(); // Trigger change detection
      },
      error: () => {
        this.showMessage('error', 'QR Code Error', 'Failed to generate QR code. Please try again.');
        this.cdr.markForCheck(); // Trigger change detection
      },
    });
  }

  downloadInvitation(participant: Participant | null): void {
    if (!this.qrCodeContent || !participant) return;

    html2canvas(this.qrCodeContent.nativeElement, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      scale: 1
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `${participant.name || 'QR_Code'}_Invitation.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(() => {
      this.showMessage('error', 'Download Error', 'Failed to download image. Please try again.');
    });
  }

  closeDialog(): void {
    this.isQrCodeDialogVisible = false;
  }

  private async generateInvitationForParticipant(participant: Participant): Promise<Blob | null> {
    const requestData = {
      eventId: this.event.id,
      phoneNumber: participant.phoneNumber,
      name: participant.name,
    };

    try {
      const response = await firstValueFrom(this.eventService.getPrivateQrCodePngImageLink(requestData));
      
      if (response.statusCode !== 200 || !response.data) return null;

      this.currentDownloadParticipant = participant;
      this.currentDownloadQrCodeLink = String(response.data);

      await this.delay(RENDER_DELAY_MS);
      await this.preloadImage(this.currentDownloadQrCodeLink);
      await this.delay(IMAGE_LOAD_DELAY_MS);

      return await this.captureElement(this.hiddenQrCodeContent.nativeElement);
    } catch (error) {
      console.error('Error generating invitation:', error);
      return null;
    }
  }

  private async finalizeDownload(zip: JSZip, successCount: number, errorCount: number): Promise<void> {
    if (successCount > 0) {
      try {
        const content = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(content, `${this.event.name}_All_Invitations.zip`);
        this.showMessage('success', 'Download Complete', 
          `Successfully downloaded ${successCount} invitations.${errorCount > 0 ? ` ${errorCount} failed.` : ''}`);
      } catch {
        this.showMessage('error', 'Download Error', 'Failed to create ZIP file.');
      }
    } else {
      this.showMessage('error', 'Download Failed', 'Failed to generate any invitations.');
    }

    this.resetDownloadState();
  }

  private resetDownloadState(): void {
    this.isDownloadingAll = false;
    this.currentDownloadParticipant = null;
    this.currentDownloadQrCodeLink = null;
  }

  private async captureElement(element: HTMLElement): Promise<Blob | null> {
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 1,
      });

      return new Promise(resolve => canvas.toBlob(blob => resolve(blob), 'image/png'));
    } catch (error) {
      console.error('html2canvas error:', error);
      return null;
    }
  }

  private preloadImage(src: string): Promise<void> {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private sanitizeFileName(name: string): string {
    return `${name}_Invitation.png`;
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }
}
