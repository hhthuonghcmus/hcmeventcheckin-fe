import { Component } from '@angular/core';
import { Column } from '../../../../interfaces/table-column.interface';
import { EventService } from '../../../../services/event.service';
import { MessageService } from 'primeng/api';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiResponse } from '../../../../interfaces/api-response.interface';
import { TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { Event } from '../../../../interfaces/event.interface';

@Component({
  selector: 'app-my-events',
  imports: [TableModule, CommonModule, Button, RouterLink, Badge],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.scss',
})
export class MyEventsComponent {
  myEvents: Event[];
  tableColumns: Column[];
  currentDate = new Date();

  constructor(
    private eventService: EventService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.tableColumns = [
      { field: 'code', header: '#' },
      { field: 'name', header: 'Name' },
      { field: 'questions.length', header: 'Questions' },
    ];

    if (isPlatformBrowser) {
      this.tableColumns = [
        { field: 'code', header: '#' },
        { field: 'name', header: 'Name' },
        { field: 'questions.length', header: 'Questions' },
      ];

      this.eventService.getMyEvents().subscribe((response: ApiResponse) => {
        this.myEvents = response.data as Event[];
      });
    }
  }

  isLarger(date1: Date, date2: Date) {
    return new Date(date1).getTime() > new Date(date2).getTime();
  }

  exportParticipantsToXlsx(eventId: string) {
    this.eventService.exportParticipantsToXlsx(eventId).subscribe(blob => {
      const file = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileName = 'Participants.xlsx';
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = fileName;
      link.click();
    });
  }

  // openVote(topicIndex: number) {
  //   var topic = this.myEvents.at(topicIndex);
  //   this.eventService.openVote(topic.id).subscribe((response: ApiReponse) => {
  //     if (response.statusCode === 200) {
  //       topic.isOpenedForVoting = true;
  //     } else {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Open vote',
  //         detail: response.message,
  //       });
  //     }
  //   });
  // }

  // closeVote(topicIndex: number) {
  //   var topic = this.myEvents.at(topicIndex);
  //   this.eventService.closeVote(topic.id).subscribe((response: ApiReponse) => {
  //     if (response.statusCode === 200) {
  //       topic.isOpenedForVoting = false;
  //     } else {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Open vote',
  //         detail: response.message,
  //       });
  //     }
  //   });
  // }
}
