import { Answer } from "./answer.interface";

export interface Question {
    text: string,
    questionType: string,
    answers: Answer[]
}