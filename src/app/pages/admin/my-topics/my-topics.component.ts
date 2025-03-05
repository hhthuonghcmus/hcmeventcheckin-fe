import { ApiReponse } from './../../../interfaces/api-response.interface';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TopicService } from '../../../services/topic.service';
import { Topic } from '../../../interfaces/topic.interface';
import { Column } from '../../../interfaces/table-column.interface';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-topics',
  imports: [TableModule, CommonModule, Button, RouterLink],
  templateUrl: './my-topics.component.html',
  styleUrl: './my-topics.component.scss',
})
export class MyTopicsComponent {
  myTopics: Topic[];
  tableColumns: Column[];

  constructor(private topicService: TopicService) {}

  ngOnInit() {
    this.tableColumns = [
      { field: 'code', header: '#' },
      { field: 'name', header: 'Name' },
      { field: 'questions.length', header: 'Questions' },
    ];

    if(isPlatformBrowser) {
      this.tableColumns = [
        { field: 'code', header: '#' },
        { field: 'name', header: 'Name' },
        { field: 'questions.length', header: 'Questions' },
      ];

      this.topicService.getMyTopics().subscribe((response: ApiReponse) => {
        this.myTopics = response.data as Topic[];
      });
  
    }
  }


}
