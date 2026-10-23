import {
  Assignment,
  AssignmentFormData,
  StudySession,
  Reminder,
  DashboardSummary,
  StudyPlanResponse,
  ChatMessage,
  UserProfile,
  AnalyticsData,
  StudentSettings,
  PlanningStrategyId
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : '/api';

// Realistic offline/fallback dataset for standalone Vercel deployments
let fallbackAssignments: Assignment[] = [
  {
    id: 'asg-1',
    user_id: 'usr-demo-123',
    title: 'CS301 Operating Systems: Virtual Memory Lab',
    description: 'Implement page replacement algorithms (FIFO, LRU, Clock) and analyze page fault ratios on synthetic traces.',
    due_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    estimated_minutes: 90,
    priority: 'HIGH',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_overdue: false,
    hours_remaining: 24,
  },
  {
    id: 'asg-2',
    user_id: 'usr-demo-123',
    title: 'CS310 Database Management: Normalization & BCNF',
    description: 'Decompose relational schemas into 3NF and BCNF. Provide functional dependency preservation proofs.',
    due_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    estimated_minutes: 60,
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_overdue: false,
    hours_remaining: 48,
  },
  {
    id: 'asg-3',
    user_id: 'usr-demo-123',
    title: 'MATH204 Linear Algebra: Eigenvalues Problem Set',
    description: 'Solve problems on characteristic polynomials, geometric multiplicity, and matrix diagonalization.',
    due_at: new Date(Date.now() + 96 * 3600 * 1000).toISOString(),
    estimated_minutes: 45,
    priority: 'LOW',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_overdue: false,
    hours_remaining: 96,
  },
  {
    id: 'asg-4',
    user_id: 'usr-demo-123',
    title: 'AI405 Machine Learning: Transformer Project Report',
    description: 'Empirical comparison of Multi-Head Self-Attention layers against Convolutional baselines on CIFAR-100.',
    due_at: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
    estimated_minutes: 120,
    priority: 'HIGH',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_overdue: false,
    hours_remaining: 120,
  },
  {
    id: 'asg-5',
    user_id: 'usr-demo-123',
    title: 'ENG201 Technical Writing: Research Abstract',
    description: 'Finalize 250-word paper abstract for conference workshop submission.',
    due_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    estimated_minutes: 30,
    priority: 'LOW',
    status: 'COMPLETED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_overdue: false,
    hours_remaining: -24,
  },
];

let fallbackSessions: StudySession[] = [
  {
    id: 'sess-1',
    user_id: 'usr-demo-123',
    assignment_id: 'asg-1',
    title: 'Study: OS Virtual Memory Page Tables',
    starts_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    notes: 'Focus on LRU page replacement algorithm implementation.',
    created_at: new Date().toISOString(),
    duration_minutes: 90,
  },
  {
    id: 'sess-2',
    user_id: 'usr-demo-123',
    assignment_id: 'asg-2',
    title: 'Study: Database 3NF & BCNF Decomposition',
    starts_at: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    status: 'SCHEDULED',
    notes: 'Practice lossless-join decomposition verification theorems.',
    created_at: new Date().toISOString(),
    duration_minutes: 60,
  },
];

let fallbackReminders: Reminder[] = [
  {
    id: 'rem-1',
    user_id: 'usr-demo-123',
    assignment_id: 'asg-1',
    message: 'Submit CS301 Virtual Memory Lab before the portal closes!',
    scheduled_at: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
    status: 'PENDING',
    created_at: new Date().toISOString(),
  },
  {
    id: 'rem-2',
    user_id: 'usr-demo-123',
    assignment_id: 'asg-2',
    message: 'Review Database BCNF decomposition examples before tutorial',
    scheduled_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: 'PENDING',
    created_at: new Date().toISOString(),
  },
];

let fallbackActivities = [
  { id: 1, type: 'assignment_created', message: "Created assignment 'CS301 Operating Systems: Virtual Memory Lab' (High Priority)", timestamp: new Date(Date.now() - 3600 * 1000).toISOString() },
  { id: 2, type: 'plan_generated', message: 'Generated 2 study sessions using Deadline-First strategy (150 min total)', timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString() },
  { id: 3, type: 'reminder_scheduled', message: 'Reminder set: Submit CS301 Virtual Memory Lab before the portal closes', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString() },
];

let fallbackSettings: StudentSettings = {
  name: 'Alex Morgan',
  email: 'alex.morgan@campus.edu',
  timezone: 'Asia/Kolkata',
  dailyStudyGoalMinutes: 150,
  voicePlaybackEnabled: true,
  pushNotifications: true,
  emailDigest: true,
  defaultStrategy: 'deadline_first',
  theme: 'dark',
};

async function request<T>(endpoint: string, options?: RequestInit, fallbackFn?: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText || res.statusText}`);
    }
    if (res.status === 204) return null as T;
    return (await res.json()) as T;
  } catch (error) {
    if (fallbackFn) {
      console.warn(`[API] Fallback used for ${endpoint}:`, error);
      return fallbackFn();
    }
    throw error;
  }
}

export const api = {
  // --- Dashboard Summary ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/dashboard/summary', undefined, () => {
      const pendingCount = fallbackAssignments.filter((a) => a.status !== 'COMPLETED').length;
      const completedCount = fallbackAssignments.filter((a) => a.status === 'COMPLETED').length;
      const overdueCount = fallbackAssignments.filter((a) => a.is_overdue).length;
      const plannedMinutes = fallbackSessions.reduce((acc, s) => acc + (s.duration_minutes || 60), 0);

      return {
        user_name: fallbackSettings.name,
        user_email: fallbackSettings.email,
        timezone: fallbackSettings.timezone,
        total_assignments: fallbackAssignments.length,
        pending_assignments_count: pendingCount,
        completed_assignments_count: completedCount,
        overdue_assignments_count: overdueCount,
        today_study_minutes_planned: plannedMinutes,
        productivity_score: 82,
        urgent_assignments: fallbackAssignments.filter((a) => a.status !== 'COMPLETED').slice(0, 4),
        today_sessions: fallbackSessions,
        upcoming_reminders: fallbackReminders.filter((r) => r.status === 'PENDING').slice(0, 3),
        recent_activities: fallbackActivities,
        weekly_breakdown: { Mon: 3, Tue: 2, Wed: 4, Thu: 2, Fri: 5, Sat: 2, Sun: 1 },
      };
    });
  },

  // --- Assignments ---
  async getAssignments(filters?: { status?: string; priority?: string; search?: string }): Promise<Assignment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);
    const qs = params.toString() ? `?${params.toString()}` : '';

    return request<Assignment[]>(`/assignments${qs}`, undefined, () => {
      let result = [...fallbackAssignments];
      if (filters?.status && filters.status !== 'ALL') {
        result = result.filter((a) => a.status === filters.status);
      }
      if (filters?.priority && filters.priority !== 'ALL') {
        result = result.filter((a) => a.priority === filters.priority);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (a) => a.title.toLowerCase().includes(query) || (a.description && a.description.toLowerCase().includes(query))
        );
      }
      return result;
    });
  },

  async createAssignment(data: AssignmentFormData): Promise<Assignment> {
    return request<Assignment>(
      '/assignments',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const now = new Date();
        const dueDate = new Date(data.due_at);
        const hoursRemaining = (dueDate.getTime() - now.getTime()) / (3600 * 1000);

        const newAsg: Assignment = {
          id: `asg-${Date.now()}`,
          user_id: 'usr-demo-123',
          title: data.title,
          description: data.description || null,
          due_at: data.due_at,
          estimated_minutes: data.estimated_minutes || 60,
          priority: data.priority || 'MEDIUM',
          status: 'PENDING',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          is_overdue: dueDate < now,
          hours_remaining: Math.round(hoursRemaining),
        };
        fallbackAssignments.unshift(newAsg);
        fallbackActivities.unshift({
          id: Date.now(),
          type: 'assignment_created',
          message: `Created assignment '${newAsg.title}' (${newAsg.priority} Priority)`,
          timestamp: now.toISOString(),
        });
        return newAsg;
      }
    );
  },

  async updateAssignment(id: string, data: Partial<AssignmentFormData>): Promise<Assignment> {
    return request<Assignment>(
      `/assignments/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      () => {
        const idx = fallbackAssignments.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error('Assignment not found');
        const updated = { ...fallbackAssignments[idx], ...data, updated_at: new Date().toISOString() };
        if (data.status === 'COMPLETED') {
          updated.is_overdue = false;
        }
        fallbackAssignments[idx] = updated;
        return updated;
      }
    );
  },

  async deleteAssignment(id: string): Promise<void> {
    return request<void>(
      `/assignments/${id}`,
      { method: 'DELETE' },
      () => {
        fallbackAssignments = fallbackAssignments.filter((a) => a.id !== id);
      }
    );
  },

  // --- Study Planner & Sessions ---
  async getStudySessions(filters?: { status?: string }): Promise<StudySession[]> {
    const qs = filters?.status ? `?status=${filters.status}` : '';
    return request<StudySession[]>(`/study-sessions${qs}`, undefined, () => {
      if (filters?.status && filters.status !== 'ALL') {
        return fallbackSessions.filter((s) => s.status === filters.status);
      }
      return fallbackSessions;
    });
  },

  async generateStudyPlan(
    availableMinutes: number,
    strategy: PlanningStrategyId = 'deadline_first',
    saveToSchedule: boolean = false
  ): Promise<StudyPlanResponse> {
    return request<StudyPlanResponse>(
      '/study-plans/generate',
      {
        method: 'POST',
        body: JSON.stringify({ available_minutes: availableMinutes, strategy, save_to_schedule: saveToSchedule }),
      },
      () => {
        const pending = fallbackAssignments.filter((a) => a.status !== 'COMPLETED');
        let sorted = [...pending];
        if (strategy === 'priority_first') {
          const weights: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          sorted.sort((a, b) => weights[b.priority] - weights[a.priority]);
        } else {
          sorted.sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());
        }

        const planItems = [];
        let remaining = availableMinutes;
        let cursorTime = new Date();

        for (const task of sorted) {
          if (remaining <= 0) break;
          const duration = Math.min(task.estimated_minutes, remaining);
          if (duration <= 0) continue;

          const start = new Date(cursorTime);
          const end = new Date(start.getTime() + duration * 60 * 1000);

          planItems.push({
            assignment_id: task.id,
            title: `Study: ${task.title}`,
            duration_minutes: duration,
            starts_at: start.toISOString(),
            ends_at: end.toISOString(),
            strategy,
            notes: `Focused revision session for ${task.title} (${duration} min)`,
          });

          cursorTime = new Date(end.getTime() + 10 * 60 * 1000); // 10 min break
          remaining -= duration + 10;
        }

        if (saveToSchedule) {
          const created: StudySession[] = planItems.map((p, idx) => ({
            id: `sess-${Date.now()}-${idx}`,
            user_id: 'usr-demo-123',
            assignment_id: p.assignment_id,
            title: p.title,
            starts_at: p.starts_at,
            ends_at: p.ends_at,
            status: 'SCHEDULED',
            notes: p.notes,
            created_at: new Date().toISOString(),
            duration_minutes: p.duration_minutes,
          }));
          fallbackSessions.push(...created);
          return {
            strategy_used: strategy,
            total_study_minutes: planItems.reduce((acc, i) => acc + i.duration_minutes, 0),
            sessions_count: planItems.length,
            plan: planItems,
            saved_sessions: created,
          };
        }

        return {
          strategy_used: strategy,
          total_study_minutes: planItems.reduce((acc, i) => acc + i.duration_minutes, 0),
          sessions_count: planItems.length,
          plan: planItems,
        };
      }
    );
  },

  async updateStudySession(id: string, data: Partial<StudySession>): Promise<StudySession> {
    return request<StudySession>(
      `/study-sessions/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      () => {
        const idx = fallbackSessions.findIndex((s) => s.id === id);
        if (idx === -1) throw new Error('Session not found');
        fallbackSessions[idx] = { ...fallbackSessions[idx], ...data };
        return fallbackSessions[idx];
      }
    );
  },

  async deleteStudySession(id: string): Promise<void> {
    return request<void>(
      `/study-sessions/${id}`,
      { method: 'DELETE' },
      () => {
        fallbackSessions = fallbackSessions.filter((s) => s.id !== id);
      }
    );
  },

  // --- Reminders ---
  async getReminders(): Promise<Reminder[]> {
    return request<Reminder[]>('/reminders', undefined, () => fallbackReminders);
  },

  async createReminder(data: { message: string; scheduled_at: string; assignment_id?: string | null }): Promise<Reminder> {
    return request<Reminder>(
      '/reminders',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const newRem: Reminder = {
          id: `rem-${Date.now()}`,
          user_id: 'usr-demo-123',
          assignment_id: data.assignment_id || null,
          message: data.message,
          scheduled_at: data.scheduled_at,
          status: 'PENDING',
          created_at: new Date().toISOString(),
        };
        fallbackReminders.unshift(newRem);
        return newRem;
      }
    );
  },

  async updateReminder(id: string, data: Partial<Reminder>): Promise<Reminder> {
    return request<Reminder>(
      `/reminders/${id}`,
      { method: 'PATCH', body: JSON.stringify(data) },
      () => {
        const idx = fallbackReminders.findIndex((r) => r.id === id);
        if (idx === -1) throw new Error('Reminder not found');
        fallbackReminders[idx] = { ...fallbackReminders[idx], ...data };
        return fallbackReminders[idx];
      }
    );
  },

  async deleteReminder(id: string): Promise<void> {
    return request<void>(
      `/reminders/${id}`,
      { method: 'DELETE' },
      () => {
        fallbackReminders = fallbackReminders.filter((r) => r.id !== id);
      }
    );
  },

  // --- AI Chat (Bedrock Converse Tool Invocations) ---
  async sendChatMessage(message: string, conversationHistory: { role: string; content: string }[] = []): Promise<any> {
    return request<any>(
      '/chat',
      {
        method: 'POST',
        body: JSON.stringify({ message, conversation_history: conversationHistory }),
      },
      () => {
        const lower = message.toLowerCase();
        let reply = "I've analyzed your academic schedule. What else would you like to plan today?";
        let executed_actions: any[] = [];
        let suggested_replies = [
          'Add Operating Systems lab due tomorrow 5 PM',
          'Plan my study for 3 hours tonight',
          'Explain Virtual Memory in OS',
          'Quiz me on Database Normalization',
        ];

        if (lower.includes('add') || lower.includes('create') || lower.includes('homework') || lower.includes('assignment')) {
          const title = message.replace(/^(add|create|log)\s+(my\s+)?/i, '').replace(/\s+(due.*)$/i, '').trim() || 'Coursework Assignment';
          const newAsg: Assignment = {
            id: `asg-${Date.now()}`,
            user_id: 'usr-demo-123',
            title,
            due_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            estimated_minutes: 60,
            priority: 'HIGH',
            status: 'PENDING',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_overdue: false,
            hours_remaining: 24,
          };
          fallbackAssignments.unshift(newAsg);
          reply = `I have logged your assignment: "${newAsg.title}" (Due tomorrow at 5:00 PM, High Priority).`;
          executed_actions.push({
            tool: 'create_assignment',
            action_type: 'command_execution',
            status: 'success',
            details: newAsg,
            summary: `Created assignment '${newAsg.title}'`,
          });
          suggested_replies = ['Plan study time for this assignment', 'Set a reminder 2 hours before due date', 'Show my updated dashboard'];
        } else if (lower.includes('plan') || lower.includes('schedule') || lower.includes('study')) {
          reply = 'Generated an optimized study plan for 120 minutes prioritizing your nearest deadlines.';
          executed_actions.push({
            tool: 'generate_study_plan',
            action_type: 'command_execution',
            status: 'success',
            details: { minutes: 120, sessions: 2 },
            summary: 'Generated 2 study sessions using Deadline-First strategy',
          });
          suggested_replies = ['Commit plan to my calendar', 'Switch to Workload Balance strategy', 'What assignments are still pending?'];
        } else if (lower.includes('remind')) {
          const newRem: Reminder = {
            id: `rem-${Date.now()}`,
            user_id: 'usr-demo-123',
            message: message.replace(/^(remind me to|set a reminder to)\s*/i, '').trim() || 'Review academic lecture',
            scheduled_at: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            status: 'PENDING',
            created_at: new Date().toISOString(),
          };
          fallbackReminders.unshift(newRem);
          reply = `Scheduled intelligent reminder: "${newRem.message}" for 2 hours before deadline.`;
          executed_actions.push({
            tool: 'create_reminder',
            action_type: 'command_execution',
            status: 'success',
            details: newRem,
            summary: `Scheduled reminder: '${newRem.message}'`,
          });
        } else if (lower.includes('explain') || lower.includes('virtual memory')) {
          reply = "Virtual memory gives programs the illusion of a large, contiguous memory space using physical RAM and swap storage. Memory Management Units (MMUs) translate virtual page addresses to physical frames using Page Tables and high-speed TLBs.";
          suggested_replies = ['Quiz me on this concept', 'Give me a real-world coding analogy', 'Explain Database Normalization'];
        }

        return {
          reply,
          action_required: false,
          executed_actions,
          suggested_replies,
        };
      }
    );
  },

  // --- Analytics ---
  async getAnalytics(): Promise<AnalyticsData> {
    return {
      weeklyHours: [
        { day: 'Mon', hours: 3.5, target: 3 },
        { day: 'Tue', hours: 2.0, target: 3 },
        { day: 'Wed', hours: 4.2, target: 3 },
        { day: 'Thu', hours: 1.5, target: 3 },
        { day: 'Fri', hours: 5.0, target: 3 },
        { day: 'Sat', hours: 2.5, target: 2 },
        { day: 'Sun', hours: 1.0, target: 2 },
      ],
      subjectDistribution: [
        { subject: 'Operating Systems', percentage: 38, color: '#8b5cf6' },
        { subject: 'Database Management', percentage: 27, color: '#3b82f6' },
        { subject: 'Machine Learning', percentage: 22, color: '#10b981' },
        { subject: 'Linear Algebra', percentage: 13, color: '#f59e0b' },
      ],
      completionTrend: [
        { week: 'Week 1', completed: 4, assigned: 5 },
        { week: 'Week 2', completed: 6, assigned: 6 },
        { week: 'Week 3', completed: 5, assigned: 7 },
        { week: 'Week 4', completed: 8, assigned: 8 },
      ],
      focusMetrics: {
        totalHoursStudied: 19.7,
        streakDays: 6,
        completionRate: 88,
        averageSessionMinutes: 52,
      },
    };
  },

  // --- Settings ---
  async getSettings(): Promise<StudentSettings> {
    return { ...fallbackSettings };
  },

  async updateSettings(data: Partial<StudentSettings>): Promise<StudentSettings> {
    fallbackSettings = { ...fallbackSettings, ...data };
    return { ...fallbackSettings };
  },

  // --- Account & Authentication ---
  async deleteAccount(): Promise<void> {
    fallbackAssignments = [];
    fallbackSessions = [];
    fallbackReminders = [];
    fallbackActivities = [];
    fallbackSettings = {
      name: 'Guest Student',
      email: 'guest@campus.edu',
      timezone: 'Asia/Kolkata',
      dailyStudyGoalMinutes: 120,
      voicePlaybackEnabled: true,
      pushNotifications: false,
      emailDigest: false,
      defaultStrategy: 'deadline_first',
      theme: 'dark',
    };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('copilot_auth_user');
      localStorage.removeItem('copilot_assignments');
    }
  },
};
