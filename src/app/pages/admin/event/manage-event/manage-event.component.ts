import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { EventService } from '../../../../services/event.service';
import { ApiResponse } from '../../../../interfaces/api-response.interface';
import { Event } from '../../../../interfaces/event.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-event',
  imports: [Button, Menu, RouterOutlet, RouterLink, RouterModule, CommonModule],
  templateUrl: './manage-event.component.html',
  styleUrl: './manage-event.component.scss'
})
export class ManageEventComponent {
  manageEventMenuItems: MenuItem[];
  eventId: string;
  event: Event;

  constructor(private activatedRoute: ActivatedRoute, private eventService: EventService) {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('id')!;
  }

  ngOnInit() {
    this.eventService.getById(this.eventId).subscribe({
      next: (response: ApiResponse) => {
        const event = response.data as Event;
        this.event = event;
        this.eventService.setCurrentEvent(event);
        
        this.manageEventMenuItems = [
          { label: 'Details', icon: 'pi pi-plus', routerLink: `/event/manage/${this.eventId}/details` },
          { label: 'Participants', icon: 'pi pi-user', routerLink: `/event/manage/${this.eventId}/participants` },
          { label: 'Lucky draw', icon: 'pi pi-box', routerLink: `/event/manage/${this.eventId}/lucky-draw` },
          { label: 'Voting statistic', icon: 'pi pi-chart-bar', routerLink: `/event/manage/${this.eventId}/voting-statistic` }
        ];
      },
      error: (error) => {
        
      },
    });


  }
}
