import { Component } from '@angular/core';
import { Topic } from '../../interfaces/topic.interface';
import { TopicService } from '../../services/topic.service';
import { ApiReponse } from '../../interfaces/api-response.interface';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { RadioButton, RadioButtonModule } from 'primeng/radiobutton';
import { Checkbox } from 'primeng/checkbox';
import { Question } from '../../interfaces/question.interface';
import { MessageService } from 'primeng/api';
import { Observable, of } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RadioButton,
    CommonModule,
    RadioButton,
    Checkbox,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  topicOpenedForVoting: Topic;
  topicVoteForm: FormGroup;
  hasVoted$: Observable<boolean>;

  constructor(
    private topicService: TopicService,
    private formBuilder: FormBuilder, 
    private messageService: MessageService,
    private router: Router,
    private userService: UserService
  ) {

  }
  
  ngOnInit() {
    this.topicVoteForm = this.formBuilder.group({});
    
    this.topicService
      .getTopicOpenedForVoting()
      .subscribe((response: ApiReponse) => {
        if (response.statusCode === 200) {
          this.topicOpenedForVoting = response.data as Topic;
          if (
            this.topicOpenedForVoting &&
            this.topicOpenedForVoting.questions
          ) {
            this.topicOpenedForVoting.questions.forEach((question: Question) => {
              this.topicVoteForm.addControl(
                question.id.toString(),
                this.formBuilder.control('', [Validators.required])
              );
            });
          }

          this.hasVoted$ = this.topicService.hasVoted(this.topicOpenedForVoting.id)
        }
        else {
          this.topicOpenedForVoting = null;
        }
      });
  }

  submitVote() {

    const questionIds_answerIds = [];
     this.topicOpenedForVoting.questions.forEach((question: Question) => {
      const questionId = question.id;
      if (question.questionType === "Single Choice") {
        const answerId = this.topicVoteForm.get(question.id.toString())?.value as string;
        questionIds_answerIds.push({questionId, answerId})
      }
      else {
        const answerIds = this.topicVoteForm.get(question.id.toString())?.value as string[];
        answerIds.forEach((answerId: string) => {
          questionIds_answerIds.push({questionId, answerId})
        })
      }
    });

    this.topicService.submiteVote(this.topicOpenedForVoting.id, questionIds_answerIds).subscribe((response: ApiReponse) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Create topic',
        detail: 'Successfully',
      });

      this.hasVoted$ = of(true);
    });
  }
}
