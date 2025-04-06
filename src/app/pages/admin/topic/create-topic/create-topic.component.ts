import { Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { QuestionService } from '../../../../services/question.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
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
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TopicService } from '../../../../services/topic.service';
import { MessageService } from 'primeng/api';
import { ApiReponse } from '../../../../interfaces/api-response.interface';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-topic',
  imports: [
    CommonModule,
    InputText,
    FloatLabel,
    Select,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    RouterLink
  ],
  templateUrl: './create-topic.component.html',
  styleUrl: './create-topic.component.scss',
})
export class CreateTopicComponent {
  topicForm: FormGroup;
  questionTypes$: Observable<string[]>;

  constructor(
    private questionService: QuestionService,
    private topicService: TopicService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.questionTypes$ = this.questionService.fetchQuestionTypes();
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
        answers: this.formBuilder.array([], this.atLeastOneAnswerValidator()),
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
    const answers = question.get('answers') as FormArray;
    answers.push(
      this.formBuilder.group({
        text: ['', Validators.required],
      })
    );
  }

  removeAnswer(questionArrayIndex: number, answerArrayIndex: number): void {
    const question = this.questions.at(questionArrayIndex);
    const answers = question.get('answers') as FormArray;
    answers.removeAt(answerArrayIndex);
  }

  createTopic() {
    console.log(this.topicForm.invalid);
    if (this.topicForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Create topic',
        detail: 'error',
      });
    } else {
      this.topicService.create(this.topicForm.value).subscribe({
        next: (response: ApiReponse) => {
          if (response['statusCode'] === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Create topic',
              detail: 'Successfully',
            });

            this.router.navigate(['topic/my-topics']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Create topic',
              detail: response['message'],
              life: 3000,
            });
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Create topic',
            detail: error,
          });
        },
      });
    }
  }

  atLeastOneAnswerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const answersArray = control as FormArray;
      if (answersArray && answersArray.length > 0) {
        return null;
      }
      return { atLeastOneAnswer: true };
    };
  }
}
