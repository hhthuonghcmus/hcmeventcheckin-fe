import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { map, Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EventService } from '../../../../services/event.service';
import { ApiReponse } from '../../../../interfaces/api-response.interface';
import { Event } from '../../../../interfaces/event.interface';
import { Topic } from '../../../../interfaces/topic.interface';
import { TopicService } from '../../../../services/topic.service';

@Component({
  selector: 'app-edit-event',
  imports: [CommonModule,
    InputText,
    FloatLabel,
    Select,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RouterLink,
    Textarea,
    DatePicker],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.scss'
})
export class EditEventComponent {
  eventForm: FormGroup;
  myTopics$: Observable<Topic[]>;
  eventId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private topicService: TopicService,
    private eventService: EventService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('id')!;
    console.log(this.eventId)
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
    this.eventService.getById(this.eventId).subscribe({
      next: (response: ApiReponse) => {
        const event = response.data as Event;
        console.log(event)
        this.eventForm.patchValue({
          name: event.name,
          location: event.location,
          description: event.description,
          startTime: new Date(event.startTime),
          luckyDrawStartTime: new Date(event.luckyDrawStartTime),
          luckyDrawEndTime: new Date(event.luckyDrawEndTime),
          votingStartTime: new Date(event.votingStartTime),
          votingEndTime: new Date(event.votingEndTime),
          topicId: event.topicId,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Edit Topic',
          detail: 'Error fetching event details.',
        });
      },
    });
  }

  confirm() {
    if (this.eventForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Edit event',
        detail: 'error',
      });
    } else {
      this.eventService.update(this.eventId, this.eventForm.value).subscribe({
        next: (response: ApiReponse) => {
          if (response['statusCode'] === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Edit event',
              detail: 'Successfully',
            });

            this.router.navigate(['event/my-events']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Edit event',
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