import { EventService } from '../../../../../../services/event.service';
import { Event } from '../../../../../../interfaces/event.interface';
import { Vote } from '../../../../../../interfaces/vote.interface';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-manage-event-voting-statistic',
  imports: [
    RippleModule,
    CommonModule,
  ],
  templateUrl: './manage-event-voting-statistic.component.html',
  styleUrl: './manage-event-voting-statistic.component.scss'
})
export class ManageEventVotingStatisticComponent {
  event: Event;
  votes: Vote[] = [];

  constructor(private eventService: EventService, private router: Router, private messageService: MessageService) {
    this.event = this.eventService.getCurrentEvent();
    
    if (!this.event) {
      this.router.navigate(['event/my-events'])
    }
  }

  ngOnInit() {
    if (this.event) {
      this.eventService.getAllVotes(
        this.event.id,
      ).subscribe((response: Vote[]) => {
        this.votes = response;
      });
    }
  }

  getTotalVotes(answerId: string) {
    const selectedAnswers = this.votes.filter(x => x.answerId === answerId);
    
    return selectedAnswers.length;
  }
}
