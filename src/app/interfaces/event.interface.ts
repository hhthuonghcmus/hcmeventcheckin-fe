import { Participant } from './participant.interface';
import { Topic } from './topic.interface';

export interface Event {
  id: string;
  name: string;
  isPrivate: boolean;
  allowAnonymousParticipant: boolean;
  participants: Participant[];
  location: string;
  description: string;
  startTime: Date;
  luckyDrawStartTime: Date;
  luckyDrawEndTime: Date;
  votingStartTime: Date;
  votingEndTime: Date;
  topicId: string;
  pin: string;

  topic: Topic;
}
