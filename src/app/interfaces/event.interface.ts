import { Participant } from './participant.interface';

export interface Event {
  id: string;
  name: string;
  isPrivate: boolean;
  participants: Participant[];
  location: string;
  description: string;
  startTime: Date;
  luckyDrawStartTime: Date;
  luckyDrawEndTime: Date;
  votingStartTime: Date;
  votingEndTime: Date;
  topicId: string;
}
