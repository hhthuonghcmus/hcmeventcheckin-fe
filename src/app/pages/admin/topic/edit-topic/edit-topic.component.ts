import { Question } from '../../../../interfaces/question.interface';
import { Answer } from '../../../../interfaces/answer.interface';
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
import { ApiResponse } from '../../../../interfaces/api-response.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Topic } from '../../../../interfaces/topic.interface';

@Component({
  selector: 'app-edit-topic',
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
  ],
  templateUrl: './edit-topic.component.html',
  styleUrl: './edit-topic.component.scss',
})
export class EditTopicComponent {
  topicForm: FormGroup;
  questionTypes$: Observable<string[]>;
  topicId: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
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

    this.topicId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.topicService.getById(this.topicId).subscribe({
      next: (response: ApiResponse) => {
        const topic = response.data as Topic;
        this.topicForm.patchValue({
          name: topic.name,
        });
        const questionsFormArray = this.formBuilder.array(
          topic.questions.map((question) =>
            this.formBuilder.group({
              text: [question.text, Validators.required],
              questionType: [question.questionType, Validators.required],
              answers: this.formBuilder.array(
                question.answers.map((answer) =>
                  this.formBuilder.group({
                    text: [answer.text, Validators.required],
                  })
                ),
                this.atLeastOneAnswerValidator()
              ),
            })
          )
        );

        this.topicForm.setControl('questions', questionsFormArray);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Edit Topic',
          detail: 'Error fetching topic details.',
        });
      },
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

  addAnswer(
    questionArrayIndex: number,
    answer = {
      text: '',
    }
  ): void {
    const question = this.questions.at(questionArrayIndex);
    const answers = question.get('answers') as FormArray;
    answers.push(
      this.formBuilder.group({
        text: [answer.text || '', Validators.required],
      })
    );
  }

  removeAnswer(questionArrayIndex: number, answerArrayIndex: number): void {
    const question = this.questions.at(questionArrayIndex);
    const answers = question.get('answers') as FormArray;
    answers.removeAt(answerArrayIndex);
  }

  update() {
    if (this.topicForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Edit topic',
        detail: 'error',
      });
    } else {
      this.topicService.update(this.topicId, this.topicForm.value).subscribe({
        next: (response: ApiResponse) => {
          if (response['statusCode'] === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Edit topic',
              detail: 'Successfully',
            });

            this.router.navigate(['topic/my-topics']);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Edit topic',
              detail: response['message'],
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
