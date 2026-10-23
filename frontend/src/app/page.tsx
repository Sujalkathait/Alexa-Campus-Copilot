'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sidebar,
  SectionTab
} from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Toast } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { useVoice } from '@/hooks/useVoice';
import { api } from '@/services/api';
import {
  Assignment,
  AssignmentFormData,
  StudySession,
  Reminder,
  DashboardSummary,
  ChatMessage,
  UserProfile,
  PlanningStrategyId,
  StudentSettings,
  AuthUser,
} from '@/types';

// Tab Views
import { DashboardView } from '@/components/modules/dashboard/DashboardView';
import { AICampusAssistant } from '@/components/modules/chat/AICampusAssistant';
import { AssignmentsView } from '@/components/modules/assignments/AssignmentsView';
import { StudyPlannerView } from '@/components/modules/planner/StudyPlannerView';
import { RemindersView } from '@/components/modules/reminders/RemindersView';
import { AnalyticsView } from '@/components/modules/analytics/AnalyticsView';
import { SettingsView } from '@/components/modules/settings/SettingsView';
import { AssignmentModal } from '@/components/modules/assignments/AssignmentModal';

// Auth Modals
import { AuthModal } from '@/components/modules/auth/AuthModal';
import { DeleteAccountModal } from '@/components/modules/auth/DeleteAccountModal';

// Icons for Quick Search
import { Search, X, CheckSquare, Calendar, Bell, ArrowRight, Sparkles } from 'lucide-react';

export default function CampusCopilotApp() {
  const [activeTab, setActiveTab] = useState<SectionTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Core Data
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [user, setUser] = useState<UserProfile>({
    id: 'usr-demo-123',
    name: 'Alex Morgan',
    email: 'alex.morgan@campus.edu',
    timezone: 'Asia/Kolkata',
    major: 'B.S. Computer Science & AI',
    isAuthenticated: true,
  });

  // Modal & Search States
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Modals State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);

  // AI Chat & Voice State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        "Hello Alex! I'm your Alexa+ Campus Copilot powered by Google Gemini. I can schedule your assignments, build optimized study plans, set deadline reminders, or explain difficult concepts. Try saying or typing: *'Plan my study for 2.5 hours tonight'* or *'Add Operating Systems lab due tomorrow 5 PM'*.",
      timestamp: new Date().toISOString(),
      suggested_replies: [
        'Add Operating Systems lab due tomorrow 5 PM',
        'Plan my study for 2.5 hours tonight',
        'Explain Virtual Memory in OS',
        'Quiz me on Database Normalization',
      ],
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Toast System
  const { toasts, addToast, dismissToast } = useToast();

  // Voice Assistant Hook
  const handleVoiceTranscript = useCallback((text: string) => {
    if (!text.trim()) return;
    setActiveTab('chat');
    handleSendChatMessage(text);
  }, []);

  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice({
    onTranscript: handleVoiceTranscript,
    onError: (err) => {
      addToast('info', `Microphone note: ${err}`, 'Voice Assistant');
    },
  });

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      const started = startListening();
      if (started) {
        addToast('info', 'Listening for your spoken academic instruction...', 'Voice Activated');
      } else {
        addToast('info', 'Speech recognition is available in modern Chromium/Safari browsers.', 'Voice Note');
      }
    }
  };

  // Initial Data Fetch
  const loadData = useCallback(async () => {
    try {
      // Check for saved user in localStorage
      if (typeof window !== 'undefined') {
        const savedUserJson = localStorage.getItem('copilot_auth_user');
        if (savedUserJson) {
          try {
            const savedUser = JSON.parse(savedUserJson);
            setUser({
              id: savedUser.id,
              name: savedUser.name,
              email: savedUser.email,
              timezone: savedUser.timezone || 'Asia/Kolkata',
              major: savedUser.major || 'Computer Science & AI',
              isAuthenticated: true,
            });
          } catch {}
        }
      }

      const [sumRes, asgRes, sessRes, remRes, settingsRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getAssignments(),
        api.getStudySessions(),
        api.getReminders(),
        api.getSettings(),
      ]);

      setSummary(sumRes);
      setAssignments(asgRes);
      setSessions(sessRes);
      setReminders(remRes);
      if (settingsRes) {
        setTtsEnabled(settingsRes.voicePlaybackEnabled);
      }
    } catch (err: any) {
      console.error('Failed to load copilot data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsQuickAddOpen(false);
        setAuthModalOpen(false);
        setDeleteAccountModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Authentication Handlers ---
  const handleLoginSuccess = (authUser: AuthUser) => {
    const updatedUser: UserProfile = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      timezone: authUser.timezone || 'Asia/Kolkata',
      major: authUser.major || 'Computer Science & AI',
      isAuthenticated: true,
    };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('copilot_auth_user', JSON.stringify(updatedUser));
    }
    addToast('success', `Welcome back, ${authUser.name}! Your coursework is synced.`, 'Signed In');
    loadData();
  };

  const handleLogout = () => {
    const guestUser: UserProfile = {
      id: 'guest',
      name: 'Guest Student',
      email: 'guest@campus.edu',
      timezone: 'Asia/Kolkata',
      isAuthenticated: false,
    };
    setUser(guestUser);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('copilot_auth_user');
    }
    addToast('info', 'You have been signed out safely.', 'Signed Out');
  };

  const handleDeleteAccount = async () => {
    await api.deleteAccount();
    const guestUser: UserProfile = {
      id: 'guest',
      name: 'Guest Student',
      email: 'guest@campus.edu',
      timezone: 'Asia/Kolkata',
      isAuthenticated: false,
    };
    setUser(guestUser);
    setAssignments([]);
    setSessions([]);
    setReminders([]);
    setSummary(null);
    setChatMessages([
      {
        id: 'post-delete-msg',
        role: 'assistant',
        content: 'Your student account and academic data have been permanently erased. You are now in a clean session. Sign in anytime to start fresh.',
        timestamp: new Date().toISOString(),
      },
    ]);
    addToast('info', 'Your academic account and all coursework have been permanently erased.', 'Account Deleted');
    setActiveTab('dashboard');
  };

  // --- Assignment Handlers ---
  const handleCreateAssignment = async (data: AssignmentFormData) => {
    try {
      const newAsg = await api.createAssignment(data);
      setAssignments((prev) => [newAsg, ...prev]);
      addToast('success', `Created assignment '${newAsg.title}'`, 'Assignment Added');
      loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Could not create assignment', 'Error');
    }
  };

  const handleUpdateAssignment = async (id: string, data: Partial<AssignmentFormData>) => {
    try {
      const updated = await api.updateAssignment(id, data);
      setAssignments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      if (data.status === 'COMPLETED') {
        addToast('success', `Marked '${updated.title}' as completed! 🎉`, 'Task Completed');
      } else {
        addToast('success', `Updated '${updated.title}'`, 'Saved');
      }
      loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Could not update assignment', 'Error');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await api.deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      addToast('info', 'Assignment removed from coursework', 'Deleted');
      loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Could not delete assignment', 'Error');
    }
  };

  // --- Study Planner Handlers ---
  const handleGenerateStudyPlan = async (
    availableMinutes: number,
    strategy: PlanningStrategyId,
    saveToSchedule: boolean
  ) => {
    const plan = await api.generateStudyPlan(availableMinutes, strategy, saveToSchedule);
    addToast(
      'info',
      `Calculated ${plan.sessions_count} sessions (${plan.total_study_minutes} mins) with ${plan.strategy_used.replace('_', ' ')} strategy`,
      'Schedule Generated'
    );
    return plan;
  };

  const handleSavePlanToSchedule = async (availableMinutes: number, strategy: PlanningStrategyId) => {
    try {
      await api.generateStudyPlan(availableMinutes, strategy, true);
      addToast('success', 'Optimized study sessions booked to calendar!', 'Schedule Saved');
      const freshSessions = await api.getStudySessions();
      setSessions(freshSessions);
      loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to save study plan', 'Error');
    }
  };

  const handleUpdateSessionStatus = async (
    id: string,
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ) => {
    try {
      const updated = await api.updateStudySession(id, { status });
      setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
      addToast('success', `Study session marked as ${status.toLowerCase()}`, 'Session Updated');
    } catch (err: any) {
      addToast('error', err.message || 'Could not update session', 'Error');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await api.deleteStudySession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      addToast('info', 'Session removed from study calendar', 'Session Removed');
    } catch (err: any) {
      addToast('error', err.message || 'Could not delete session', 'Error');
    }
  };

  // --- Reminders Handlers ---
  const handleCreateReminder = async (data: { message: string; scheduled_at: string; assignment_id?: string | null }) => {
    try {
      const newRem = await api.createReminder(data);
      setReminders((prev) => [newRem, ...prev]);
      addToast('success', `Reminder set for ${new Date(newRem.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 'Reminder Set');
      loadData();
    } catch (err: any) {
      addToast('error', err.message || 'Could not create reminder', 'Error');
    }
  };

  const handleUpdateReminder = async (id: string, data: Partial<Reminder>) => {
    try {
      const updated = await api.updateReminder(id, data);
      setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
      addToast('info', `Reminder marked as ${updated.status.toLowerCase()}`, 'Updated');
    } catch (err: any) {
      addToast('error', err.message || 'Could not update reminder', 'Error');
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r.id !== id));
      addToast('info', 'Reminder cancelled', 'Reminder Removed');
    } catch (err: any) {
      addToast('error', err.message || 'Could not remove reminder', 'Error');
    }
  };

  // --- AI Chat Assistant Handler ---
  const handleSendChatMessage = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const history = chatMessages.slice(-4).map((m) => ({ role: m.role, content: m.content }));
      let response = await api.sendChatMessage(query, history);

      if (typeof response === 'string') {
        try {
          response = JSON.parse(response);
        } catch {
          response = { reply: response };
        }
      }

      let cleanReply = response?.reply || '';
      let executedActions = response?.executed_actions || [];
      let suggestedReplies = response?.suggested_replies || [];

      // If reply itself is a stringified JSON object (as shown in user demo video/screenshot), extract clean message
      if (typeof cleanReply === 'string' && cleanReply.trim().startsWith('{')) {
        try {
          const inner = JSON.parse(cleanReply.trim());
          if (inner.reply) {
            cleanReply = inner.reply;
            if (inner.executed_actions && inner.executed_actions.length > 0) {
              executedActions = inner.executed_actions;
            }
            if (inner.suggested_replies && inner.suggested_replies.length > 0) {
              suggestedReplies = inner.suggested_replies;
            }
          }
        } catch {
          const match = cleanReply.match(/"reply"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
          if (match) {
            cleanReply = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: cleanReply,
        timestamp: new Date().toISOString(),
        action_required: response?.action_required,
        executed_actions: executedActions,
        suggested_replies: suggestedReplies,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);

      if (ttsEnabled && cleanReply) {
        speak(cleanReply);
      }

      if (executedActions && executedActions.length > 0) {
        loadData();
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue processing that instruction: ${err.message || 'Network error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const overdueCount = useMemo(() => assignments.filter((a) => a.is_overdue).length, [assignments]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const asgMatches = assignments
      .filter((a) => a.title.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q)))
      .map((a) => ({
        type: 'assignment' as const,
        id: a.id,
        title: a.title,
        subtitle: `Due: ${new Date(a.due_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} • ${a.priority} Priority`,
        tab: 'assignments' as SectionTab,
      }));

    const sessMatches = sessions
      .filter((s) => s.title.toLowerCase().includes(q) || (s.notes && s.notes.toLowerCase().includes(q)))
      .map((s) => ({
        type: 'session' as const,
        id: s.id,
        title: s.title,
        subtitle: `Time: ${new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        tab: 'planner' as SectionTab,
      }));

    const remMatches = reminders
      .filter((r) => r.message.toLowerCase().includes(q))
      .map((r) => ({
        type: 'reminder' as const,
        id: r.id,
        title: r.message,
        subtitle: `Scheduled: ${new Date(r.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        tab: 'reminders' as SectionTab,
      }));

    return [...asgMatches, ...sessMatches, ...remMatches].slice(0, 8);
  }, [searchQuery, assignments, sessions, reminders]);

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100 flex relative overflow-x-hidden w-full max-w-full selection:bg-purple-500/30 selection:text-purple-200">
      {/* Subtle ambient lighting safely contained to prevent any horizontal scroll overflow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-1/3 w-[650px] h-[340px] bg-gradient-to-tr from-purple-600/10 via-indigo-600/8 to-pink-500/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-10 w-[500px] h-[260px] bg-gradient-to-tl from-purple-900/10 via-indigo-950/10 to-transparent blur-[140px] rounded-full" />
      </div>

      {/* Toast Notification Layer */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        overdueCount={overdueCount}
        onQuickAddAssignment={() => setIsQuickAddOpen(true)}
        weeklyHoursStudied={summary?.today_study_minutes_planned ? Number((summary.today_study_minutes_planned / 60 + 12).toFixed(1)) : 15.8}
        weeklyTargetHours={20}
        user={user}
        onOpenLoginModal={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main App Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleVoice={handleToggleVoice}
          isListening={isListening}
          user={user}
          onOpenQuickSearch={() => setIsSearchOpen(true)}
          pendingCount={assignments.filter((a) => a.status !== 'COMPLETED').length}
          onOpenLoginModal={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
          onOpenRegisterModal={() => {
            setAuthModalMode('register');
            setAuthModalOpen(true);
          }}
          onLogout={handleLogout}
          onOpenDeleteAccountModal={() => setDeleteAccountModalOpen(true)}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* Viewport Router Switch */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={summary}
              loading={loading}
              onNavigate={(tab) => setActiveTab(tab)}
              onQuickAddAssignment={() => setIsQuickAddOpen(true)}
              onCompleteAssignment={(id) => handleUpdateAssignment(id, { status: 'COMPLETED' })}
            />
          )}

          {activeTab === 'chat' && (
            <AICampusAssistant
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              loading={chatLoading}
              isListening={isListening}
              onToggleVoice={handleToggleVoice}
              voiceTranscript={transcript}
              isSpeaking={isSpeaking}
              onStopSpeaking={stopSpeaking}
              onSpeakText={speak}
              ttsEnabled={ttsEnabled}
              onToggleTts={() => {
                setTtsEnabled((prev) => !prev);
                addToast('info', !ttsEnabled ? 'Voice playback enabled' : 'Voice playback muted', 'TTS Audio');
              }}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsView
              assignments={assignments}
              loading={loading}
              onCreateAssignment={handleCreateAssignment}
              onUpdateAssignment={handleUpdateAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onScheduleForTask={(task) => {
                setActiveTab('planner');
                addToast('info', `Switched to Study Planner for '${task.title}'`, 'Study Plan');
              }}
              isCreateModalOpen={isQuickAddOpen}
              setIsCreateModalOpen={setIsQuickAddOpen}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlannerView
              sessions={sessions}
              loading={loading}
              onGeneratePlan={handleGenerateStudyPlan}
              onSavePlanToSchedule={handleSavePlanToSchedule}
              onUpdateSessionStatus={handleUpdateSessionStatus}
              onDeleteSession={handleDeleteSession}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              assignments={assignments}
              loading={loading}
              onCreateReminder={handleCreateReminder}
              onUpdateReminder={handleUpdateReminder}
              onDeleteReminder={handleDeleteReminder}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'settings' && (
            <SettingsView
              onAddToast={addToast}
              onSettingsUpdated={(newSettings: StudentSettings) => {
                setUser((prev) => ({
                  ...prev,
                  name: newSettings.name,
                  email: newSettings.email,
                  timezone: newSettings.timezone,
                }));
                setTtsEnabled(newSettings.voicePlaybackEnabled);
              }}
              onLogout={handleLogout}
              onOpenDeleteAccountModal={() => setDeleteAccountModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Global Quick Add Assignment Modal */}
      <AssignmentModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleCreateAssignment}
      />

      {/* Authentication Modal (Login / Register / Quick Demo) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Delete Account Modal (Double-confirmation safety flow) */}
      <DeleteAccountModal
        isOpen={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
        onConfirmDelete={handleDeleteAccount}
        userName={user.name}
      />

      {/* Global Command Palette / Quick Search Modal (⌘K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coursework, tasks, study sessions... (Type or hit Esc)"
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                  <p>Type a keyword like <span className="text-slate-300">"Operating"</span>, <span className="text-slate-300">"Database"</span>, or <span className="text-slate-300">"Linear"</span>.</p>
                  <p className="text-[11px] text-slate-600">Quickly jump across any academic section.</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching coursework or sessions found.
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        setActiveTab(res.tab);
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 rounded-xl hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {res.type === 'assignment' && <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                        {res.type === 'session' && <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                        {res.type === 'reminder' && <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <div className="truncate">
                          <div className="text-slate-200 font-medium truncate">{res.title}</div>
                          <div className="text-[10px] text-slate-500">{res.subtitle}</div>
                        </div>
                      </div>

                      <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1 shrink-0">
                        Jump to {res.tab} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2.5 bg-[#0a0d14] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>ProTip: Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Esc</kbd> to close</span>
              <span>Alexa+ Campus Copilot</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
