import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { useVoice } from './hooks/useVoice';

// Components
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ChatVoiceTab } from './components/ChatVoiceTab';
import { AssignmentsTab } from './components/AssignmentsTab';
import { StudyPlannerTab } from './components/StudyPlannerTab';
import { StudyAssistantTab } from './components/StudyAssistantTab';
import { RemindersTab } from './components/RemindersTab';
import { Toast } from './components/Toast';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Initial chat welcome message
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        "Hello Alex! I'm Alexa+ Campus Copilot, your AI academic productivity assistant. You can speak to me or type commands like: 'Add my Operating Systems assignment due tomorrow 5 PM', 'Plan my study schedule for 3 hours tonight', or 'Explain Virtual Memory in OS'. How can I help you excel today?",
      suggested_replies: [
        'Add my Operating Systems assignment due tomorrow 5 PM',
        'Plan my study for 3 hours tonight',
        'Explain Virtual Memory in OS',
        'Quiz me on Database Normalization',
      ],
    },
  ]);

  // Toast Helper
  const addToast = useCallback((type, message, title = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Voice Hook
  const {
    isListening,
    isSpeaking,
    transcript: voiceTranscript,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice({
    onTranscript: (spokenText) => {
      if (spokenText.trim().length > 3) {
        handleSendMessage(spokenText.trim());
      }
    },
    onError: (err) => {
      addToast('error', `Microphone error: ${err}`);
    },
  });

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      const started = startListening();
      if (started) {
        addToast('info', 'Listening... Speak your command clearly.');
      } else {
        addToast('error', 'Microphone not supported or permission denied in this browser.');
      }
    }
  };

  // Fetch all initial data
  const refreshAllData = useCallback(async () => {
    try {
      const [sumRes, assignRes, sessRes, remRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getAssignments(),
        api.getStudySessions(),
        api.getReminders(),
      ]);
      setSummary(sumRes);
      setAssignments(assignRes);
      setSessions(sessRes);
      setReminders(remRes);
    } catch (err) {
      console.error('Error loading campus copilot data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle Send Chat Message (Text or Spoken)
  const handleSendMessage = async (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage(queryText, historyPayload);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        action_required: res.action_required,
        missing_fields: res.missing_fields,
        executed_actions: res.executed_actions,
        suggested_replies: res.suggested_replies,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Read response aloud if TTS enabled
      if (ttsEnabled && res.reply) {
        speak(res.reply);
      }

      // If an action was executed, refresh data and show toast
      if (res.executed_actions && res.executed_actions.length > 0) {
        refreshAllData();
        const firstAction = res.executed_actions[0];
        addToast('success', firstAction.summary, 'Action Executed');
      }
    } catch (err) {
      addToast('error', err.message || 'Could not process query', 'Assistant Error');
    } finally {
      setChatLoading(false);
    }
  };

  // Assignment Handlers
  const handleCreateAssignment = async (data) => {
    try {
      await api.createAssignment(data);
      addToast('success', `Created assignment '${data.title}'`, 'Success');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Failed');
    }
  };

  const handleUpdateAssignment = async (id, data) => {
    try {
      await api.updateAssignment(id, data);
      addToast('success', 'Assignment updated successfully', 'Saved');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  const handleDeleteAssignment = async (id) => {
    try {
      await api.deleteAssignment(id);
      addToast('info', 'Assignment removed', 'Deleted');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  // Study Planner Handlers
  const handleGeneratePlan = async (availableMinutes, strategy, saveToSchedule) => {
    try {
      const res = await api.generateStudyPlan(availableMinutes, strategy, saveToSchedule);
      addToast(
        'info',
        `Generated ${res.sessions_count} sessions using ${strategy.replace('_', ' ').toUpperCase()} strategy.`,
        'Plan Generated'
      );
      if (saveToSchedule) {
        refreshAllData();
      }
      return res;
    } catch (err) {
      addToast('error', err.message, 'Planner Error');
      throw err;
    }
  };

  const handleSavePlanToSchedule = async (availableMinutes, strategy) => {
    try {
      await api.generateStudyPlan(availableMinutes, strategy, true);
      addToast('success', 'Study sessions committed to calendar!', 'Saved');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Failed to save');
    }
  };

  const handleUpdateSessionStatus = async (id, status) => {
    try {
      await api.updateStudySession(id, { status });
      addToast('success', `Session marked as ${status}`, 'Updated');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await api.deleteStudySession(id);
      addToast('info', 'Session deleted from schedule', 'Removed');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  // Reminder Handlers
  const handleCreateReminder = async (data) => {
    try {
      await api.createReminder(data);
      addToast('success', `Reminder scheduled: '${data.message}'`, 'Reminder Created');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  const handleUpdateReminder = async (id, data) => {
    try {
      await api.updateReminder(id, data);
      addToast('success', 'Reminder updated', 'Updated');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.deleteReminder(id);
      addToast('info', 'Reminder cancelled', 'Cancelled');
      refreshAllData();
    } catch (err) {
      addToast('error', err.message, 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Ambient background glowing orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isListening={isListening}
        onToggleVoice={toggleVoice}
        studentName={summary?.user_name || 'Alex Morgan'}
        studentTimezone={summary?.timezone || 'Asia/Kolkata'}
        overdueCount={summary?.overdue_assignments_count || 0}
      />

      {/* Main Tab Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            summary={summary}
            loading={loading}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewAssignment={() => setIsAssignmentModalOpen(true)}
            onCompleteAssignment={(id) => handleUpdateAssignment(id, { status: 'COMPLETED' })}
          />
        )}

        {activeTab === 'chat' && (
          <ChatVoiceTab
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={chatLoading}
            isListening={isListening}
            onToggleVoice={toggleVoice}
            voiceTranscript={voiceTranscript}
            isSpeaking={isSpeaking}
            onStopSpeaking={stopSpeaking}
            onSpeakText={speak}
            ttsEnabled={ttsEnabled}
            onToggleTts={() => setTtsEnabled(!ttsEnabled)}
          />
        )}

        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            loading={loading}
            onCreateAssignment={handleCreateAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onScheduleForTask={(task) => {
              setActiveTab('planner');
            }}
            isModalOpen={isAssignmentModalOpen}
            setIsModalOpen={setIsAssignmentModalOpen}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlannerTab
            sessions={sessions}
            loading={loading}
            onGeneratePlan={handleGeneratePlan}
            onSavePlanToSchedule={handleSavePlanToSchedule}
            onUpdateSessionStatus={handleUpdateSessionStatus}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'hub' && (
          <StudyAssistantTab onAddToast={addToast} />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            assignments={assignments}
            loading={loading}
            onCreateReminder={handleCreateReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Alexa+ Campus Copilot</span>
            <span>•</span>
            <span>AI understands & plans, backend services validate & execute</span>
          </div>
          <div>
            Built with React, Tailwind CSS, FastAPI, Amazon Bedrock Tool-Calling & PostgreSQL
          </div>
        </div>
      </footer>

      {/* Global Toast Alerts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export default App;
