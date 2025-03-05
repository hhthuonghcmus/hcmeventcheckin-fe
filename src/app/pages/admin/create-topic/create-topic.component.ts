import { Component } from '@angular/core';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { QuestionType } from '../../../interfaces/question-type.interface';
import { QuestionService } from '../../../services/question.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RadioButton } from 'primeng/radiobutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Button, ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-create-topic',
  imports: [ CommonModule, InputText, FloatLabel, Select, RadioButton, ReactiveFormsModule, FormsModule, ButtonModule, RippleModule],
  templateUrl: './create-topic.component.html',
  styleUrl: './create-topic.component.scss',
})
export class CreateTopicComponent {
  questionTypes$: Observable<QuestionType[]>;
  categories: any[] = [
    { name: 'Accounting', key: 'A' },
    { name: 'Marketing', key: 'M' },
    { name: 'Production', key: 'P' },
    { name: 'Research', key: 'R' }
];
selectedCategory: any = null;

  constructor(private questionService: QuestionService) {
    this.questionTypes$ = this.questionService.questionTypes$.asObservable();
  }

  ngOnInit() {
    this.questionService.fetchQuestionTypes();
  }
}
