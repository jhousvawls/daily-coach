export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: number;
  text: string;
  description?: string;
  category: 'personal' | 'professional';
  targetDate?: string;
  progress: number; // 0-100
  subtasks: SubTask[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goals {
  personal: Goal[];
  professional: Goal[];
}

export interface TinyGoal {
  id: number;
  text: string;
  completedAt?: string;
  createdAt?: string;
}
