export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type SessionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'UPCOMING';
export type ReminderStatus = 'PENDING' | 'SENT' | 'CANCELLED';
export type PlanningStrategyId = 'deadline_first' | 'priority_first' | 'workload_balance';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  timezone: string;
  studentId?: string;
  major?: string;
  semester?: string;
  targetGpa?: number;
  avatarUrl?: string;
  isAuthenticated?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  major?: string;
  university?: string;
  token?: string;
}

export type AuthModalMode = 'login' | 'register' | 'delete-account';

export interface Assignment {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  due_at: string;
  estimated_minutes: number;
  priority: Priority;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
  is_overdue?: boolean;
  hours_remaining?: number | null;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  due_at: string;
  estimated_minutes: number;
  priority: Priority;
  status?: AssignmentStatus;
}

export interface StudySession {
  id: string;
  user_id: string;
  assignment_id?: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
  status: SessionStatus;
  notes?: string | null;
  created_at: string;
  duration_minutes?: number;
}

export interface Reminder {
  id: string;
  user_id: string;
  assignment_id?: string | null;
  message: string;
  scheduled_at: string;
  status: ReminderStatus;
  sent_at?: string | null;
  created_at: string;
}

export interface ExecutedAction {
  tool: string;
  action_type: string;
  status: 'success' | 'error';
  details: Record<string, any>;
  summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  action_required?: boolean;
  missing_fields?: string[];
  executed_actions?: ExecutedAction[];
  suggested_replies?: string[];
  timestamp?: string;
}

export interface StudyPlanItem {
  assignment_id?: string;
  title: string;
  duration_minutes: number;
  starts_at: string;
  ends_at: string;
  strategy: string;
  notes?: string;
}

export interface StudyPlanResponse {
  strategy_used: string;
  total_study_minutes: number;
  sessions_count: number;
  plan: StudyPlanItem[];
  saved_sessions?: StudySession[];
}

export interface ActivityFeedItem {
  id: number | string;
  type: string;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface DashboardSummary {
  user_name: string;
  user_email: string;
  timezone: string;
  total_assignments: number;
  pending_assignments_count: number;
  completed_assignments_count: number;
  overdue_assignments_count: number;
  today_study_minutes_planned: number;
  productivity_score: number;
  urgent_assignments: Assignment[];
  today_sessions: StudySession[];
  upcoming_reminders: Reminder[];
  recent_activities: ActivityFeedItem[];
  weekly_breakdown: Record<string, number>;
}

export interface AnalyticsData {
  weeklyHours: { day: string; hours: number; target: number }[];
  subjectDistribution: { subject: string; percentage: number; color: string }[];
  completionTrend: { week: string; completed: number; assigned: number }[];
  focusMetrics: {
    totalHoursStudied: number;
    streakDays: number;
    completionRate: number;
    averageSessionMinutes: number;
  };
}

export interface StudentSettings {
  name: string;
  email: string;
  timezone: string;
  dailyStudyGoalMinutes: number;
  voicePlaybackEnabled: boolean;
  pushNotifications: boolean;
  emailDigest: boolean;
  defaultStrategy: PlanningStrategyId;
  theme: 'dark' | 'system' | 'light';
}
