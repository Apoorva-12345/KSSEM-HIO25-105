import type { Part } from '@google/genai';

export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export type Feedback = 'like' | 'dislike' | null;

export interface ChatMessage {
  role: Role;
  parts: Part[];
  quiz?: QuizQuestion[];
  feedback?: Feedback;
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  EXPERT = 'Expert',
}

export interface PerformanceStats {
  correct: number;
  incorrect: number;
  quizzesTaken: number;
  accuracyHistory: number[]; 
}

export interface GamificationStats {
  xp: number;
  level: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  difficulty: Difficulty;
}
