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
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

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

  addQuestion(): void {
    this.questions.push(
      this.formBuilder.group({
        text: ['', Validators.required],
        questionType: ['', Validators.required],
        answers: this.formBuilder.array([]),
      })
    );
  }

  get questions(): FormArray {
    return this.topicForm.get('questions') as FormArray;
  }

  getAnswers(questionArrayIndex: number): FormArray {
    const question = this.questions.at(questionArrayIndex);
    return question.get('answers') as FormArray;
  }

  removeQuestion(questionArrayIndex: number): void {
    this.questions.removeAt(questionArrayIndex);
  }

  addAnswer(questionArrayIndex: number): void {
    const question = this.questions.at(questionArrayIndex);
    const answers =  question.get('answers') as FormArray;
    answers.push(
      this.formBuilder.group({
        text: ['', Validators.required],
      })
    );
  }

  removeAnswer(questionArrayIndex: number, answerArrayIndex: number): void {
    const question = this.questions.at(questionArrayIndex);
    const answers =  question.get('answers') as FormArray;
    answers.removeAt(answerArrayIndex);
  }

  createTopic() {}

  back() {}

  onSubmit() {}
}
