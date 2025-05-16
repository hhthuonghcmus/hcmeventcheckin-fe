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
import { ApiResponse } from '../../../../interfaces/api-response.interface';
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
import { RadioButton } from 'primeng/radiobutton';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import { ToggleButton } from 'primeng/togglebutton';

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
    DatePicker,
    RadioButton,
    FileUpload,
    TableModule,
    ToggleButton,
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
  ) {}

  ngOnInit() {
    this.myTopics$ = this.topicService.getMyTopics().pipe(
      map((response: ApiResponse) => {
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

        this.participants.setValue([]);
        jsonData.forEach((row: any) => {
          const propertyNames = Object.keys(row);
          this.participants.value.push({
            name: row[propertyNames[0]],
            phoneNumber: row[propertyNames[1]],
            luckydrawCode: row[propertyNames[2]],
          });
        });
      };
    }
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
        next: (response: ApiResponse) => {
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
