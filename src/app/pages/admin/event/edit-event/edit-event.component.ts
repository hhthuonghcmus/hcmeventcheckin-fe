import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../../../../interfaces/api-response.interface';
import { TopicService } from '../../../../services/topic.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Textarea } from 'primeng/textarea';
import { DatePicker } from 'primeng/datepicker';
import { Topic } from '../../../../interfaces/topic.interface';
import { Event } from '../../../../interfaces/event.interface';
import { EventService } from '../../../../services/event.service';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import { ToggleButton } from 'primeng/togglebutton';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-edit-event',
  imports: [
    CommonModule,
    InputText,
    FloatLabel,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RouterLink,
    Textarea,
    DatePicker,
    FileUpload,
    TableModule,
    ToggleButton,
    CheckboxModule,
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
    this.myTopics$ = this.topicService.getMyTopics().pipe(
      map((response: ApiResponse) => {
        const myTopics = response.data as Topic[];
        return myTopics;
      })
    );

    this.eventForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      isPrivate: [false, [Validators.required]],
      allowAnonymousParticipant: [false, [Validators.required]],
      participants: this.formBuilder.array([]), // Changed from [[]] to this.formBuilder.array([])
      isParticipantTableVisible: [false],
      location: [''],
      description: [''],
      startTime: ['', Validators.required],
      luckyDrawStartTime: ['', Validators.required],
      luckyDrawEndTime: ['', Validators.required],
    });

    this.eventService.getById(this.eventId).subscribe({
      next: (response: ApiResponse) => {
        const event = response.data as Event;
        
        // Clear and populate the FormArray with existing participants
        const participantsArray = this.participants;
        participantsArray.clear();
        event.participants.forEach(participant => {
          participantsArray.push(this.formBuilder.group(participant));
        });
        
        this.eventForm.patchValue({
          name: event.name,
          isPrivate: event.isPrivate,
          allowAnonymousParticipant: event.allowAnonymousParticipant,
          isParticipantTableVisible: false,
          location: event.location,
          description: event.description,
          startTime: new Date(event.startTime),
          luckyDrawStartTime: new Date(event.luckyDrawStartTime),
          luckyDrawEndTime: new Date(event.luckyDrawEndTime),
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
    const file = event.currentFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        // Clear the FormArray and add new items properly
        this.participants.clear();
        jsonData.forEach((row: any) => {
          const propertyNames = Object.keys(row);
          this.participants.push(this.formBuilder.group({
            name: String(row[propertyNames[0]] ?? ''),
            companyEmail: String(row[propertyNames[1]] ?? ''),
            personalId: String(row[propertyNames[2]] ?? ''),
            chairId: String(row[propertyNames[3]] ?? ''),
            luckyDrawCode: String(row[propertyNames[4]] ?? ''),
          }));
        });
      };
    }
  }

  confirm() {
    console.log(this.eventForm.value)
    if (this.eventForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Edit event',
        detail: 'Please fill in all required fields',
      });
      return;
    }

    this.eventService.update(this.eventId, this.eventForm.value).subscribe({
      next: (response: ApiResponse) => {
        if (response['statusCode'] === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Edit event',
            detail: 'Event updated successfully',
          });

          this.router.navigate(['event/my-events']);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Edit event',
            detail: response['message'] || 'Failed to update event',
          });
        }
      },
      error: (error) => {
        console.error('Update error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Edit event',
          detail: error?.error?.message || 'Failed to update event',
        });
      },
    });
  }
}
