/**
 * Backend API ile uyumlu tipler.
 * app/models/schemas.py içindeki Pydantic modellerinin TS karşılıkları.
 */

export type Source = {
  url: string;
  title: string;
  relevance_score: number;
};

export type ChatResponse = {
  answer: string;
  sources: Source[];
  model: string;
  chunks_used: number;
  needs_clarification: boolean;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  needsClarification?: boolean;
  timestamp: number;
};
