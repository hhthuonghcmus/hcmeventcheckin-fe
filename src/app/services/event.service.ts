import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Event } from '../interfaces/event.interface';
import { map } from 'rxjs';
import { Vote } from '../interfaces/vote.interface';
import { StringDecoder } from 'string_decoder';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  apiUrl = API_BASE_URL + 'event';
  currentEvent: Event;

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

  update(eventId: string, event: any) {
    console.log('Updating event:', eventId, event);
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

  checkinPrivateEvent(data: any) {
    return this.httpClient.post<ApiResponse>(
      `${this.apiUrl}/checkin-private-event`,
      data
    );
  }
  
  receivePrizeEvent(data: any) {
    return this.httpClient.post<ApiResponse>(
      `${this.apiUrl}/receive-prize`,
      data
    );
  }

  participateEvent(data: any) {
    return this.httpClient.post<ApiResponse>(
      `${this.apiUrl}/participate-event`,
      data
    );
  }

  getParticipatedEvent(companyEmail: string) {
    return this.httpClient.get<ApiResponse>(
      `${this.apiUrl}/get-participated-event/${companyEmail}`
    );
  }

  setCurrentEvent(event: Event) {
    this.currentEvent = event;
  }

  getCurrentEvent() {
    return this.currentEvent;
  }

  submitVote(eventId: string, phoneNumber: string, questionIds_answerIds: any) {
    const data = {
      eventId,
      phoneNumber,
      questionIds_answerIds,
    };
    return this.httpClient.post<ApiResponse>(
      API_BASE_URL + `event/submit-vote`,
      data
    );
  }

  hasVoted(eventId: string, phoneNumber: string) {
    const data = {
      eventId,
      phoneNumber,
    };
    return this.httpClient
      .post<ApiResponse>(API_BASE_URL + `event/has-voted`, data)
      .pipe(
        map((response: ApiResponse) => {
          const hasVoted = response.data as unknown as boolean;
          return hasVoted;
        })
      );
  }

  getVotesByPhoneNumber(eventId: string, phoneNumber: string) {
    const data = {
      eventId,
      phoneNumber,
    };
    return this.httpClient
      .post<ApiResponse>(API_BASE_URL + `event/get-votes`, data)
      .pipe(
        map((response: ApiResponse) => {
          const votes = response.data as Vote[];

          return votes;
        })
      );
  }

  getAllVotes(eventId: string) {
    return this.httpClient
      .get<ApiResponse>(API_BASE_URL + `event/get-votes/${eventId}`)
      .pipe(
        map((response: ApiResponse) => {
          const votes = response.data as Vote[];
          return votes;
        })
      );
  }

  getAlphabeticalTextOfAnswerIndex(answerIndex: number) {
    return String.fromCharCode(65 + answerIndex);
  }

  getLuckyDrawCodeByCompanyEmail(eventId: string, companyEmail: string) {
    return this.httpClient.get<ApiResponse>(
      API_BASE_URL + `event/get-lucky-draw-code/${eventId}`,
      { params: { companyEmail } }
    );
  }

  exportParticipantsToXlsx(eventId: string) {
    return this.httpClient.get(API_BASE_URL + `event/export-participants-to-xlsx/${eventId}`, {
      responseType: 'blob'
    });
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
}
