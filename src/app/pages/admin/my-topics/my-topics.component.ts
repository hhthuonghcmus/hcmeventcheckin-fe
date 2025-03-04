import { UserService } from './../../../services/user.service';
import { ApiReponse } from './../../../interfaces/api-response.interface';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { TableModule } from 'primeng/table';
import { TopicService } from '../../../services/topic.service';
import { Topic } from '../../../interfaces/topic.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { platform } from 'os';
import { AppService } from '../../../services/app.service';

@Component({
  selector: 'app-my-topics',
  imports: [TableModule],
  templateUrl: './my-topics.component.html',
  styleUrl: './my-topics.component.scss',
})
export class MyTopicsComponent {
  myTopics: Topic[];

  constructor(
    private topicService: TopicService,
  ) {}

  ngOnInit() {
    this.topicService.getMyTopics().subscribe((response: ApiReponse) => {
      console.log(response);
      this.myTopics = response.data as Topic[];
    });
  }
}
