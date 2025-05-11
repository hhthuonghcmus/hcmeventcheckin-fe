import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { EventService } from '../../../../../../services/event.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

interface Winner {
  name: string;
  phoneNumber: string;
  drawTime: Date;
}

@Component({
  selector: 'app-manage-event-lucky-draw',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  templateUrl: './manage-event-lucky-draw.component.html',
  styleUrl: './manage-event-lucky-draw.component.scss',
})
export class ManageEventLuckyDrawComponent implements OnInit {
  event: any;
  isSpinning = false;
  winners: Winner[] = [];
  currentWinner: Winner | null = null;
  availableParticipants: any[] = [];
  cyclingName: string = '';

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
    this.availableParticipants = [...this.event.participants];
  }

  startLuckyDraw() {
    if (this.availableParticipants.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Lucky Draw',
        detail: 'No more participants available for draw',
      });
      return;
    }

    this.isSpinning = true;
    let cycleCount = 0;
    const maxCycles = 20;
    const cycleInterval = 100;

    const winnerIndex = Math.floor(
      Math.random() * this.availableParticipants.length
    );
    const winner = this.availableParticipants[winnerIndex];

    const cycleCallback = () => {
      if (cycleCount >= maxCycles) {
        clearInterval(cycle);

        const newWinner: Winner = {
          name: winner.name,
          phoneNumber: winner.phoneNumber,
          drawTime: new Date(),
        };

        this.availableParticipants.splice(winnerIndex, 1);
        this.currentWinner = newWinner;
        this.winners.unshift(newWinner);
        this.isSpinning = false;
        return;
      }

      // Show random participant during animation
      let randomIndex = Math.floor(
        Math.random() * this.availableParticipants.length
      );
      const randomParticipant = this.availableParticipants[randomIndex];
      this.cyclingName = randomParticipant.name;

      cycleCount++;
      if (cycleCount > maxCycles * 0.7) {
        // Slow down towards the end
        clearInterval(cycle);
        cycle = setInterval(cycleCallback, cycleInterval * 2);
      }
    };

    let cycle = setInterval(cycleCallback, cycleInterval);
  }

  resetLuckyDraw() {
    this.winners = [];
    this.currentWinner = null;
    this.availableParticipants = [...this.event.participants];
  }
}
