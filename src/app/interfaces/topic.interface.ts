import { Question } from "./question.interface"

export interface Topic {
    name: string
    questions: Question[]
}