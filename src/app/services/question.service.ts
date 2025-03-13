import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuestionType } from '../interfaces/question-type.interface';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiReponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  public questionTypes$ = new BehaviorSubject<string[]>([]);

  constructor(private httpClient: HttpClient) {

  }

  fetchQuestionTypes(): void {
    this.getQuestionTypes().subscribe((response: ApiReponse) => {
      const questionTypes = response.data as QuestionType[];
      const questionTypeNames = questionTypes.map(questionType => {
        return questionType.name;
      })
      this.questionTypes$.next(questionTypeNames);
    });
  }

  getQuestionTypes(): Observable<ApiReponse> {
    return this.httpClient.get<ApiReponse>(
      API_BASE_URL + 'question/get-question-types'
    );
  }
}
