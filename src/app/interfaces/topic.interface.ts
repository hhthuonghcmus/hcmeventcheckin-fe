import { Question } from "./question.interface"
import { v4 as uuidv4 } from 'uuid';

export interface Topic {
    id: string
    name: string
    questions: Question[]
    isOpenedForVoting: boolean
}