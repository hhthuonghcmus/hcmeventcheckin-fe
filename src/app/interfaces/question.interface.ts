import { Answer } from "./answer.interface";

export interface Question {
    id: string
    text: string
    questionType: string
    answers: Answer[]
}