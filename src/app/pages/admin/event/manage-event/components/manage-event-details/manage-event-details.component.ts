import { Component } from '@angular/core';
import { Event } from '../../../../../../interfaces/event.interface';
import { EventService } from '../../../../../../services/event.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-event-details',
  imports: [CommonModule, TableModule],
  templateUrl: './manage-event-details.component.html',
  styleUrl: './manage-event-details.component.scss'
})
export class ManageEventDetailsComponent {
  event: Event;
  myEvents: Event[] = [];
  constructor(private eventService: EventService, private router: Router) {
    this.event = this.eventService.getCurrentEvent();
    if (!this.event) {
      this.router.navigate(['event/my-events'])
    }
  }

  ngOnInit() {
    this.myEvents = [...this.myEvents, this.event];
  }
} 
