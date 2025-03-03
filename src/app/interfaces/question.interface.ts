import { Answer } from "./answer.interface";

export interface Question {
    text: string,
    questionTypeName: string,
    answers: Answer[]
}