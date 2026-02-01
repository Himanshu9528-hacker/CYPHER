
export enum AppMode {
  STANDARD = 'STANDARD',
  HACKER = 'HACKER'
}

export interface User {
  id: string;
  username: string;
  photo?: string;
  isHacker: boolean;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string; // Added to link session to user
  title: string;
  messages: Message[];
  mode: AppMode;
  lastUpdated: number;
}

export interface AppState {
  premiumUnlocked: boolean;
  hackerTrialCount: number;
  activeSessionId: string | null;
  sessions: ChatSession[];
}

export interface Vulnerability {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  category: string;
  description: string;
  remediation: string;
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  vulnerabilities: Vulnerability[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  category: string;
  completed: boolean;
}
