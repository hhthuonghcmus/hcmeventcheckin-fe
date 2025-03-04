import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiReponse } from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class TopicService {

  constructor(
    private httpClient: HttpClient,
    private cookieService: CookieService
  ) {}

  getMyTopics() {
    return this.httpClient.get<ApiReponse>(API_BASE_URL + 'topic/get-my-created-topics');
  }
}
