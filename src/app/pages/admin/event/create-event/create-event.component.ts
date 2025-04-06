import { Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { ApiReponse } from '../../../../interfaces/api-response.interface';
import { QuestionService } from '../../../../services/question.service';
import { TopicService } from '../../../../services/topic.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Topic } from '../../../../interfaces/topic.interface';
import { EventService } from '../../../../services/event.service';

@Component({
  selector: 'app-create-event',
  imports: [
    CommonModule,
    InputText,
    FloatLabel,
    Select,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RouterLink,
    Textarea,
    DatePicker
  ],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
})
export class CreateEventComponent {
  eventForm: FormGroup;
  myTopics$: Observable<Topic[]>;

  constructor(
    private topicService: TopicService,
    private eventService: EventService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.myTopics$ = this.topicService.getMyTopics().pipe(
      map((response: ApiReponse) => {
        const myTopics = response.data as Topic[];
        return myTopics;
      })
    );
    
    this.eventForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      location: [''],
      description: [''],
      startTime: ['', Validators.required],
      luckyDrawStartTime: ['', Validators.required],
      luckyDrawEndTime: ['', Validators.required],
      votingStartTime: ['', Validators.required],
      votingEndTime: ['', Validators.required],
      topicId: [null, Validators.required],
    });
  }


  createEvent() {
    if (this.eventForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Create topic',
        detail: 'error',
      });
    } else {
      this.eventService.create(this.eventForm.value).subscribe({
        next: (response: ApiReponse) => {
          if (response['statusCode'] === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Create event',
              detail: 'Successfully',
            });

            this.router.navigate(['event/my-events']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Create event',
              detail: response['message'],
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Create event',
            detail: error,
          });
        },
      });
    }
  }
}
