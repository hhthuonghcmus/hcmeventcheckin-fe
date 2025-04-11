import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from '@angular/forms';
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
import { RadioButton } from 'primeng/radiobutton';
import {
  FileSelectEvent,
  FileUpload,
  FileUploadEvent,
} from 'primeng/fileupload';
import { UploadEvent } from '../../../../interfaces/upload-event.interface';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import { ToggleButton } from 'primeng/togglebutton';

@Component({
  selector: 'app-edit-event',
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
    DatePicker,
    RadioButton,
    FileUpload,
    TableModule,
    ToggleButton,
  ],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.scss',
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
  ) {}

  ngOnInit() {
    this.eventId = this.activatedRoute.snapshot.paramMap.get('id')!;
    console.log(this.eventId);
    this.myTopics$ = this.topicService.getMyTopics().pipe(
      map((response: ApiReponse) => {
        const myTopics = response.data as Topic[];
        return myTopics;
      })
    );

    this.eventForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      isPrivate: [true, [Validators.required]],
      participants: [[]],
      isParticipantTableVisible: [false],
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
        console.log(event);
        this.eventForm.patchValue({
          name: event.name,
          isPrivate: event.isPrivate,
          participants: event.participants,
          isParticipantTableVisible: false,
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

  get participants() {
    return this.eventForm.get('participants') as FormArray;
  }

  selectParticipantsXlsxFile(event: FileSelectEvent) {
    console.log(event.currentFiles);
    const file = event.currentFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        console.log(jsonData)
        this.participants.controls = [];
        jsonData.forEach((row: any) => {
          console.log(row)
          const propertyNames = Object.keys(row);
          this.participants.value.push({
            name: row[propertyNames[0]],
            phoneNumber: row[propertyNames[1]],
          });
        });
      };
    }
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
