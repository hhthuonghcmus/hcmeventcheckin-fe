import { Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { QuestionType } from '../../../interfaces/question-type.interface';
import { QuestionService } from '../../../services/question.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button, ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Topic } from '../../../interfaces/topic.interface';
import { text } from 'stream/consumers';

@Component({
  selector: 'app-create-topic',
  imports: [
    CommonModule,
    InputText,
    FloatLabel,
    Select,
    RadioButton,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './create-topic.component.html',
  styleUrl: './create-topic.component.scss',
})
export class CreateTopicComponent {
  topicForm: FormGroup;
  questionTypes$: Observable<QuestionType[]>;
  categories: any[] = [
    { name: 'Accounting', key: 'A' },
    { name: 'Marketing', key: 'M' },
    { name: 'Production', key: 'P' },
    { name: 'Research', key: 'R' },
  ];
  selectedCategory: any = null;

  constructor(
    private questionService: QuestionService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.questionTypes$ = this.questionService.questionTypes$.asObservable();
    this.questionService.fetchQuestionTypes();
    this.topicForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      questions: this.formBuilder.array([]),
    });
  }

  addQuestion() {
    const questions = this.topicForm.get('questions') as FormArray;
    questions.push(this.formBuilder.group({
      text: ['', Validators.required],
      answers: this.formBuilder.array([])
    }));
    console.log(this.topicForm.value)
    console.log(questions)
  }

  createTopic() {}

  back() {}

  onSubmit() {

  }
}
