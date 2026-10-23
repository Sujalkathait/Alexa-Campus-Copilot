import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Sliders,
  CheckCircle2,
  Volume2,
  Shield,
  Save,
  Trash2,
  LogOut,
  AlertTriangle,
  KeyRound
} from 'lucide-react';
import { api } from '@/services/api';
import { StudentSettings, PlanningStrategyId } from '@/types';

interface SettingsViewProps {
  onAddToast?: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
  onSettingsUpdated?: (settings: StudentSettings) => void;
  onLogout?: () => void;
  onOpenDeleteAccountModal?: () => void;
}

export function SettingsView({
  onAddToast,
  onSettingsUpdated,
  onLogout,
  onOpenDeleteAccountModal,
}: SettingsViewProps) {
  const [settings, setSettings] = useState<StudentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [dailyGoal, setDailyGoal] = useState(150);
  const [voicePlayback, setVoicePlayback] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [defaultStrategy, setDefaultStrategy] = useState<PlanningStrategyId>('deadline_first');

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getSettings();
        setSettings(s);
        setName(s.name);
        setEmail(s.email);
        setTimezone(s.timezone);
        setDailyGoal(s.dailyStudyGoalMinutes);
        setVoicePlayback(s.voicePlaybackEnabled);
        setPushNotifs(s.pushNotifications);
        setEmailDigest(s.emailDigest);
        setDefaultStrategy(s.defaultStrategy);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateSettings({
        name,
        email,
        timezone,
        dailyStudyGoalMinutes: dailyGoal,
        voicePlaybackEnabled: voicePlayback,
        pushNotifications: pushNotifs,
        emailDigest: emailDigest,
        defaultStrategy,
      });
      setSettings(updated);
      onSettingsUpdated?.(updated);
      onAddToast?.('success', 'Profile and academic preferences saved successfully', 'Settings Saved');
    } catch (err: any) {
      onAddToast?.('error', err.message || 'Failed to save settings', 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-12 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Student Profile & Preferences</h1>
        <p className="text-xs text-slate-400">Configure your academic credentials, AI defaults, and notification preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Student Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Academic Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-100 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                <option value="America/New_York">America/New_York (EST - UTC-5:00)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST - UTC-8:00)</option>
                <option value="Europe/London">Europe/London (GMT - UTC+0:00)</option>
                <option value="Europe/Paris">Europe/Paris (CET - UTC+1:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Degree Major</label>
              <input
                type="text"
                disabled
                value="B.S. Computer Science & AI"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI & Planning Preferences */}
        <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-violet-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">AI Planning Preferences</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 font-semibold">Daily Study Target:</span>
                <span className="font-mono text-blue-300 font-bold">{Math.floor(dailyGoal / 60)}h {dailyGoal % 60}m</span>
              </div>
              <input
                type="range"
                min="60"
                max="360"
                step="15"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Default Study Planning Strategy</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'deadline_first' as PlanningStrategyId, name: 'Deadline-First' },
                  { id: 'priority_first' as PlanningStrategyId, name: 'Priority-First' },
                  { id: 'workload_balance' as PlanningStrategyId, name: 'Workload-Balanced' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setDefaultStrategy(s.id)}
                    className={`py-2 px-3 rounded-xl border font-semibold transition-all ${
                      defaultStrategy === s.id
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Voice & Notifications */}
        <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">Speech & Notifications</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-200">Text-to-Speech Voice Responses</div>
                <div className="text-[11px] text-slate-400">Speak AI Copilot responses aloud when using voice commands</div>
              </div>
              <input
                type="checkbox"
                checked={voicePlayback}
                onChange={(e) => setVoicePlayback(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-200">Assignment Deadline Alerts</div>
                <div className="text-[11px] text-slate-400">Trigger browser notifications 2 hours prior to assignment cutoffs</div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifs}
                onChange={(e) => setPushNotifs(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-200">Weekly Academic Digest</div>
                <div className="text-[11px] text-slate-400">Receive Sunday email summaries of upcoming exams and study milestones</div>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Account Security & Danger Zone - UI/UX Principle: Progressive Disclosure & Error Prevention */}
      <div className="p-5 rounded-2xl bg-[#0f1422] border border-rose-900/40 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-900/40">
          <Shield className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Account & Data Security</h2>
        </div>

        <div className="space-y-3 text-xs">
          {/* Sign Out Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-slate-200">Session Management</div>
              <div className="text-[11px] text-slate-400">Sign out of this browser session safely without affecting saved coursework.</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Delete Account Danger Card */}
          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Account & Erase Academic Data</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Permanently wipe your student profile, all registered coursework, generated schedules, and AI history.
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenDeleteAccountModal}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-white font-medium transition-all flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
