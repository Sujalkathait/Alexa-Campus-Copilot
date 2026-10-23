const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Chat & Voice AI Assistant
  async sendChatMessage(message, conversationHistory = []) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_history: conversationHistory }),
    });
    return handleResponse(res);
  },

  // Dashboard
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return handleResponse(res);
  },

  // Assignments
  async getAssignments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE}/assignments?${params.toString()}`);
    return handleResponse(res);
  },

  async createAssignment(data) {
    const res = await fetch(`${API_BASE}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateAssignment(id, data) {
    const res = await fetch(`${API_BASE}/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteAssignment(id) {
    const res = await fetch(`${API_BASE}/assignments/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Study Planner & Sessions
  async generateStudyPlan(availableMinutes, strategy = 'deadline_first', saveToSchedule = false) {
    const res = await fetch(`${API_BASE}/study-plans/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        available_minutes: availableMinutes,
        strategy,
        save_to_schedule: saveToSchedule,
      }),
    });
    return handleResponse(res);
  },

  async getStudySessions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/study-sessions?${params.toString()}`);
    return handleResponse(res);
  },

  async createStudySession(data) {
    const res = await fetch(`${API_BASE}/study-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateStudySession(id, data) {
    const res = await fetch(`${API_BASE}/study-sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteStudySession(id) {
    const res = await fetch(`${API_BASE}/study-sessions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Reminders
  async getReminders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.onlyUpcoming) params.append('only_upcoming', 'true');
    const res = await fetch(`${API_BASE}/reminders?${params.toString()}`);
    return handleResponse(res);
  },

  async createReminder(data) {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateReminder(id, data) {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteReminder(id) {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Study Assistant (Explain, Quiz, Summarize)
  async explainConcept(topic, difficulty = 'undergraduate') {
    const res = await fetch(`${API_BASE}/study-assistant/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty }),
    });
    return handleResponse(res);
  },

  async generateQuiz(topic, numQuestions = 3) {
    const res = await fetch(`${API_BASE}/study-assistant/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, num_questions: numQuestions }),
    });
    return handleResponse(res);
  },

  async summarizeNotes(content, focus = 'exam_revision') {
    const res = await fetch(`${API_BASE}/study-assistant/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, focus }),
    });
    return handleResponse(res);
  },

  // User Profile
  async getUserProfile() {
    const res = await fetch(`${API_BASE}/user/profile`);
    return handleResponse(res);
  },

  async updateUserTimezone(timezone) {
    const res = await fetch(`${API_BASE}/user/timezone`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone }),
    });
    return handleResponse(res);
  },
};
