import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../constants/api.constant';
import { ApiResponse } from '../interfaces/api-response.interface';
import { Topic } from '../interfaces/topic.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  constructor(private httpClient: HttpClient) {}

  getMyTopics() {
    return this.httpClient.get<ApiResponse>(
      API_BASE_URL + 'topic/get-my-created-topics'
    );
  }

  getById(id: string) {
    return this.httpClient.get<ApiResponse>(API_BASE_URL + `topic/${id}`);
  }

  create(topic: Topic) {
    return this.httpClient.post<ApiResponse>(
      API_BASE_URL + 'topic/create',
      topic
    );
  }

  update(topicId: string, topic: Topic) {
    return this.httpClient.post<ApiResponse>(
      API_BASE_URL + `topic/update/${topicId}`,
      topic
    );
  }

  openVote(topicId: string) {
    return this.httpClient.get<ApiResponse>(
      API_BASE_URL + `topic/open-vote/${topicId}`
    );
  }

  closeVote(topicId: string) {
    return this.httpClient.get<ApiResponse>(
      API_BASE_URL + `topic/close-vote/${topicId}`
    );
  }

  getTopicOpenedForVoting() {
    return this.httpClient.get<ApiResponse>(
      API_BASE_URL + 'topic/get-topic-opened-for-voting'
    );
  }
}
