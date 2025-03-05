import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { QuestionType } from '../interfaces/question-type.interface';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../constants/api.constant';
import { Question } from '../interfaces/question.interface';
import { ApiReponse } from '../interfaces/api-response.interface';
import { response } from 'express';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  public questionTypes$ = new BehaviorSubject<QuestionType[]>([]);

  constructor(private httpClient: HttpClient) {

  }

  fetchQuestionTypes() {
    this.getQuestionTypes().subscribe((response: ApiReponse) => {
      this.questionTypes$.next(response.data as QuestionType[]);
    });
  }

  getQuestionTypes(): Observable<ApiReponse> {
    return this.httpClient.get<ApiReponse>(
      API_BASE_URL + 'question/get-question-types'
    );
  }
}
