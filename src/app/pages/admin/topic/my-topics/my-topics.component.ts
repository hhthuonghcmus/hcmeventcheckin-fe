import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Column } from '../../../../interfaces/table-column.interface';
import { Topic } from '../../../../interfaces/topic.interface';
import { TopicService } from '../../../../services/topic.service';
import { ApiResponse } from '../../../../interfaces/api-response.interface';

@Component({
  selector: 'app-my-topics',
  imports: [TableModule, CommonModule, Button, RouterLink],
  templateUrl: './my-topics.component.html',
  styleUrl: './my-topics.component.scss',
})
export class MyTopicsComponent {
  myTopics: Topic[];
  tableColumns: Column[];

  constructor(
    private topicService: TopicService,
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

      this.topicService.getMyTopics().subscribe((response: ApiResponse) => {
        this.myTopics = response.data as Topic[];
      });
    }
  }

  openVote(topicIndex: number) {
    var topic = this.myTopics.at(topicIndex);
    this.topicService.openVote(topic.id).subscribe((response: ApiResponse) => {
      if (response.statusCode === 200) {
        topic.isOpenedForVoting = true;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Open vote',
          detail: response.message,
        });
      }
    });
  }

  closeVote(topicIndex: number) {
    var topic = this.myTopics.at(topicIndex);
    this.topicService.closeVote(topic.id).subscribe((response: ApiResponse) => {
      if (response.statusCode === 200) {
        topic.isOpenedForVoting = false;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Open vote',
          detail: response.message,
        });
      }
    });
  }
}
