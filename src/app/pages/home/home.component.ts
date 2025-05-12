import { Component } from '@angular/core';
import { Topic } from '../../interfaces/topic.interface';
import { TopicService } from '../../services/topic.service';
import { ApiResponse } from '../../interfaces/api-response.interface';
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
import { EventService } from '../../services/event.service';
import { CookieService } from 'ngx-cookie-service';
import { USER_PARTICIPATED_EVENT_PIN, USER_PHONE_NUMBER } from '../../constants/cookie.constant';
import { Event } from '../../interfaces/event.interface';
import { response } from 'express';
import { Vote } from '../../interfaces/vote.interface';

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
  event: Event;
  phoneNumber: string;
  votes: Vote[] = [];

  constructor(
    private topicService: TopicService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private userService: UserService,
    private eventService: EventService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    this.phoneNumber = this.cookieService.get(USER_PHONE_NUMBER);
    if (this.phoneNumber) {
      this.eventService
        .getParticipatedEvent(this.phoneNumber)
        .subscribe((response: ApiResponse) => {
          if (response.statusCode === 200) {
            this.event = response.data as Event;
            this.topicOpenedForVoting = this.event.topic;
            console.log(this.topicOpenedForVoting)
            if (
              this.topicOpenedForVoting &&
              this.topicOpenedForVoting.questions
            ) {
              this.topicOpenedForVoting.questions.forEach(
                (question: Question) => {
                  this.topicVoteForm.addControl(
                    question.id.toString(),
                    this.formBuilder.control('', [Validators.required])
                  );
                }
              );
            }

            this.eventService.getVotes(
              this.event.id,
              this.phoneNumber
            ).subscribe((response: Vote[]) => {
              this.votes = response;
              console.log(this.votes);
              this.hasVoted$ = of(this.votes.length !== 0)
              console.log(this.votes.length !== 0);
            });

          } else {
            this.topicOpenedForVoting = null;
          }
        });
    }

    this.topicVoteForm = this.formBuilder.group({});
  }

  submitVote() {
    const questionIds_answerIds = [];
    this.topicOpenedForVoting.questions.forEach((question: Question) => {
      const questionId = question.id;
      if (question.questionType === 'Single Choice') {
        const answerId = this.topicVoteForm.get(question.id.toString())
          ?.value as string;
        questionIds_answerIds.push({ questionId, answerId });
      } else {
        const answerIds = this.topicVoteForm.get(question.id.toString())
          ?.value as string[];
        answerIds.forEach((answerId: string) => {
          questionIds_answerIds.push({ questionId, answerId });
        });
      }
    });

    this.eventService
      .submitVote(this.event.id, this.phoneNumber, questionIds_answerIds)
      .subscribe((response: ApiResponse) => {
        if (response.statusCode === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Submit vote',
            detail: 'Successfully',
          });

          window.location.href = "/";
        }
        else {
          this.messageService.add({
            severity: 'error',
            summary: 'Submit vote',
            detail: response.message,
          });
        }
      });
  }

  isAnswerSelected(questionId: string, answerId: string) {
    const vote = this.votes.find(x => x.questionId === questionId && x.answerId === answerId);
    if (vote) {
      return true;
    }

    return false;
  }
}
