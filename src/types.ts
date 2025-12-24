export interface Interview {
  id: string;
  role: string;
  status: 'in_progress' | 'completed';
  score: number | null;
  feedback: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Message {
  id: string;
  interview_id: string;
  role: 'ai' | 'user';
  content: string;
  created_at: string;
}

export const INTERVIEW_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Product Manager',
  'DevOps Engineer',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
];
