import { Injectable } from '@angular/core';
import { asyncScheduler, BehaviorSubject, map, Observable, scheduled } from 'rxjs';
import { QuestionType } from '../interfaces/question-type.interface';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiReponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  public questionTypes: string[] = [];

  constructor(private httpClient: HttpClient) {

  }

  fetchQuestionTypes(): Observable<string[]> {
    if (this.questionTypes.length > 0) {
      return scheduled([this.questionTypes], asyncScheduler);
    }
    
    return this.getQuestionTypes().pipe(
      map((response: ApiReponse) => {
        const questionTypes = response.data as QuestionType[];
        this.questionTypes = questionTypes.map(questionType => questionType.name);

        return this.questionTypes;
      })
    );
  }

  getQuestionTypes(): Observable<ApiReponse> {
    return this.httpClient.get<ApiReponse>(
      API_BASE_URL + 'question/get-question-types'
    );
  }
}
function of(questionTypes: string[]): Observable<string[]> {
  throw new Error('Function not implemented.');
}

