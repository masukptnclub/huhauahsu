export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  fullName?: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  active: boolean;
  created_at: string;
}

export interface TryoutSession {
  id: string;
  name: string;
  package_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  package: Package;
}

export interface UserTryout {
  id: string;
  created_at: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'scored';
  final_score: number | null;
  package: Package;
  session: TryoutSession;
}

export interface Subtest {
  id: string;
  name: string;
  package_id: string;
  duration: number;
  order: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'MC' | 'SA';
  options?: Record<string, string>;
  correct_answer: string;
  subtest_id: string;
}

export interface UserAnswer {
  question_id: string;
  answer_text: string | null;
  is_flagged: boolean;
}