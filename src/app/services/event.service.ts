import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Topic } from '../interfaces/topic.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  apiUrl = API_BASE_URL + 'event';

  constructor(private httpClient: HttpClient) {}

  getMyEvents() {
    return this.httpClient.get<ApiResponse>(
      API_BASE_URL + 'event/get-my-created-events'
    );
  }

  getById(id: string) {
    return this.httpClient.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  create(event: Event) {
    return this.httpClient.post<ApiResponse>(`${this.apiUrl}/create`, event);
  }

  update(eventId: string, event: Event) {
    console.log(event);
    return this.httpClient.post<ApiResponse>(
      `${this.apiUrl}/update/${eventId}`,
      event
    );
  }

  getPrivateQrCodePngImageLink(data: any) {
    return this.httpClient.post<ApiResponse>(
      `${this.apiUrl}/private-qr-code`,
      data
    );
  }

  // openVote(topicId: string) {
  //   return this.httpClient.get<ApiReponse>(
  //     API_BASE_URL + `event/open-vote/${topicId}`
  //   );
  // }

  // closeVote(topicId: string) {
  //   return this.httpClient.get<ApiReponse>(
  //     API_BASE_URL + `event/close-vote/${topicId}`
  //   );
  // }

  // getTopicOpenedForVoting() {
  //   return this.httpClient.get<ApiReponse>(
  //     API_BASE_URL + 'event/get-topic-opened-for-voting'
  //   );
  // }

  // submiteVote(topicId: string, data: any) {
  //   return this.httpClient.post<ApiReponse>(
  //     API_BASE_URL + `event/submit-vote/${topicId}`,
  //     data
  //   );
  // }

  // hasVoted(topicId: string) {
  //   return this.httpClient
  //     .get<ApiReponse>(API_BASE_URL + `event/has-voted/${topicId}`)
  //     .pipe(
  //       map((response: ApiReponse) => {
  //         const hasVoted = response.data as unknown as boolean;
  //         return hasVoted;
  //       })
  //     );
  // }
}
