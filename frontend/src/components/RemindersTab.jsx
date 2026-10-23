import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  X
} from 'lucide-react';

export function RemindersTab({
  reminders,
  assignments = [],
  loading,
  onCreateReminder,
  onUpdateReminder,
  onDeleteReminder,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [assignmentId, setAssignmentId] = useState('');

  const openModal = () => {
    setMessage('');
    const inTwoHours = new Date();
    inTwoHours.setHours(inTwoHours.getHours() + 2);
    setScheduledAt(inTwoHours.toISOString().slice(0, 16));
    setAssignmentId('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !scheduledAt) return;

    await onCreateReminder({
      message: message.trim(),
      scheduled_at: new Date(scheduledAt).toISOString(),
      assignment_id: assignmentId || null,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Intelligent Reminder System</h1>
          <p className="text-xs text-slate-400">Assignment countdowns, exam milestone notifications, and deduplication protection</p>
        </div>

        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Reminder</span>
        </button>
      </div>

      {/* Info Banner on Deduplication */}
      <div className="glass-panel p-4 rounded-2xl border border-purple-500/20 bg-purple-950/20 flex items-center gap-3 text-xs text-purple-200">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />
        <span>
          <strong className="text-white">Smart Deduplication Active:</strong> Reminders created via natural language or voice are automatically verified against existing scheduled alerts to prevent duplicate or spam notifications.
        </span>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading reminders...</div>
      ) : reminders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800 text-slate-400">
          <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
          <p className="text-base font-medium text-slate-300">No active reminders found.</p>
          <p className="text-xs text-slate-500 mt-1">Ask the AI Copilot to set one or click "Set Reminder" above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => {
            const isSent = rem.status === 'SENT';
            const isPending = rem.status === 'PENDING';
            const scheduledDate = new Date(rem.scheduled_at);

            return (
              <div
                key={rem.id}
                className={`glass-card p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isSent
                    ? 'border-slate-800 bg-slate-900/30 opacity-70'
                    : 'border-slate-800 hover:border-purple-500/30'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isPending
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rem.status}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-100">{rem.message}</h3>

                  <div className="text-xs text-purple-300/90 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() =>
                      onUpdateReminder(rem.id, {
                        status: isPending ? 'SENT' : 'PENDING',
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1 ${
                      isPending
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isPending ? 'Mark Delivered' : 'Reset'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Cancel reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Set Academic Reminder</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reminder Message *</label>
                <input
                  type="text"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Submit CS301 page replacement algorithm before portal closes"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scheduled Delivery Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                />
              </div>

              {assignments.length > 0 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Link to Assignment (Optional)</label>
                  <select
                    value={assignmentId}
                    onChange={(e) => setAssignmentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-purple-500"
                  >
                    <option value="">No linked assignment</option>
                    {assignments.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-600/30 transition-all hover:scale-105"
                >
                  Schedule Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
