// Agency Focus Types

export interface AgencyLeverSubtask {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface AgencyLever {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  subtasks: AgencyLeverSubtask[];
}

export type AgencyBucket = 'core' | 'expansion' | 'maintain';

export interface Agency {
  id: string;
  name: string;
  detail: string; // e.g. "Retainer · $12k/mo", "Prospect", "Project · $8k"
  bucket: AgencyBucket;
  levers: AgencyLever[];
  createdAt: string;
  updatedAt: string;
}

export interface AgencyFocusData {
  quarter: string; // e.g. "Q2 2026"
  agencies: Agency[];
}

// Quarterly Key Focus Areas Types

export interface KeyFocusArea {
  id: string;
  title: string;
  description: string;
  progress: number; // 0-100, manually set
  color: string; // Tailwind color for progress bar, e.g. "red", "blue", "green"
  createdAt: string;
  updatedAt: string;
}

export interface QuarterlyFocusData {
  quarter: string; // e.g. "Q2"
  dateRange: string; // e.g. "Apr – Jun 2026"
  areas: KeyFocusArea[];
}
