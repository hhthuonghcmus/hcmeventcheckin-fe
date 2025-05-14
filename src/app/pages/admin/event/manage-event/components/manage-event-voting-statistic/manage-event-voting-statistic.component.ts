import { EventService } from '../../../../../../services/event.service';
import { Event } from '../../../../../../interfaces/event.interface';
import { Vote } from '../../../../../../interfaces/vote.interface';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';
import { BaseChartDirective } from 'ng2-charts';
import { ChartOptions } from 'chart.js';
import { Question } from '../../../../../../interfaces/question.interface';
import { partition } from 'rxjs';

@Component({
  selector: 'app-manage-event-voting-statistic',
  imports: [
    RippleModule,
    CommonModule,
    ChartModule,
    BaseChartDirective
  ],
  templateUrl: './manage-event-voting-statistic.component.html',
  styleUrl: './manage-event-voting-statistic.component.scss'
})
export class ManageEventVotingStatisticComponent {


  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
  };


  pieChartLegend = true;
  pieChartPlugins = [];

  event: Event;
  votes: Vote[] = [];

  constructor(public eventService: EventService, private router: Router, private messageService: MessageService) {
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

  getChartLabels(questionId: string) {
    var question = this.event.topic.questions.find(x => x.id == questionId);

    var chartLabels = [];
    for (var i = 0; i < question.answers.length; i++) {
      chartLabels.push(this.eventService.getAlphabeticalTextOfAnswerIndex(i));
    }

    chartLabels.push("Not voted");

    return chartLabels;
  }

  getChartDatasets(questionId: string) {
    const question = this.event.topic.questions.find(x => x.id == questionId);

    const chartDatasets = [{
      data: []
    }];

    question.answers.forEach(answer => {
      const selectedAnswers = this.votes.filter(x => x.answerId == answer.id);
      chartDatasets[0].data.push(selectedAnswers.length);
    });

    const votedPhoneNumbers = this.votes.filter(x => x.questionId === questionId).map(x => x.phoneNumber);
    const notVotedParticipants = this.event.participants.filter(participant => votedPhoneNumbers.indexOf(participant.phoneNumber) === -1);
    chartDatasets[0].data.push(notVotedParticipants.length);

    return chartDatasets;
  }

  getCharData(questionId: string) {
    const labels = [];
    const datasets = [{
      data: []
    }];

    const question = this.event.topic.questions.find(x => x.id == questionId);
    
    // Voted answers
    question.answers.forEach((answer, i) => {
      const selectedAnswers = this.votes.filter(x => x.answerId == answer.id);

      datasets[0].data.push(selectedAnswers.length);
      labels.push(this.eventService.getAlphabeticalTextOfAnswerIndex(i) + ` (${selectedAnswers.length})`);
    });

    // Not voted 
    const votedPhoneNumbers = this.votes.filter(x => x.questionId === questionId).map(x => x.phoneNumber);
    const notVotedParticipants = this.event.participants.filter(participant => votedPhoneNumbers.indexOf(participant.phoneNumber) === -1);

    datasets[0].data.push(notVotedParticipants.length);
    labels.push(`Not voted (${notVotedParticipants.length})`);

    return {
      labels,
      datasets
    }
  }
}