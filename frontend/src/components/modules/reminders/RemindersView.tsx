import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Reminder, Assignment } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface RemindersViewProps {
  reminders: Reminder[];
  assignments?: Assignment[];
  loading: boolean;
  onCreateReminder: (data: { message: string; scheduled_at: string; assignment_id?: string | null }) => Promise<void>;
  onUpdateReminder: (id: string, data: Partial<Reminder>) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
}

export function RemindersView({
  reminders,
  assignments = [],
  loading,
  onCreateReminder,
  onUpdateReminder,
  onDeleteReminder,
}: RemindersViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setMessage('');
    const inTwoHours = new Date();
    inTwoHours.setHours(inTwoHours.getHours() + 2);
    setScheduledAt(inTwoHours.toISOString().slice(0, 16));
    setAssignmentId('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Intelligent Reminder System</h1>
          <p className="text-xs text-slate-400">Timely assignment notifications with automated duplicate prevention</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Set Reminder</span>
        </button>
      </div>

      {/* Deduplication Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 flex items-center gap-3 text-xs text-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong className="text-white">Smart Deduplication Guard:</strong> Reminders scheduled through conversational AI or voice are cross-referenced to prevent redundant notifications.
        </span>
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading reminders...</div>
      ) : reminders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0f1422] border border-slate-800 text-slate-400">
          <Bell className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-medium text-slate-300">No active reminders found.</p>
          <p className="text-xs text-slate-500 mt-0.5">Click "Set Reminder" or ask the AI assistant to remind you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((rem) => {
            const isPending = rem.status === 'PENDING';
            const scheduledDate = new Date(rem.scheduled_at);

            return (
              <div
                key={rem.id}
                className="p-4 rounded-xl bg-[#0f1422] border border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rem.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {scheduledDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-100 leading-snug">{rem.message}</h3>

                  <div className="flex items-center gap-1.5 text-blue-300 text-[11px] font-mono">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() =>
                      onUpdateReminder(rem.id, {
                        status: isPending ? 'SENT' : 'PENDING',
                      })
                    }
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors flex items-center gap-1 ${
                      isPending
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{isPending ? 'Mark Delivered' : 'Reset'}</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(rem.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                    title="Cancel reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Reminder Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Academic Reminder"
        description="Schedule proactive notifications for submission windows and exams."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Reminder Message *</label>
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Submit CS301 lab before the portal closes"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Scheduled Delivery Time *</label>
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          {assignments.length > 0 && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Link to Assignment (Optional)</label>
              <select
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
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

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm transition-all"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={async () => {
          if (deletingId) {
            await onDeleteReminder(deletingId);
            setDeletingId(null);
          }
        }}
        title="Cancel Reminder"
        message="Are you sure you want to cancel and remove this reminder?"
        confirmLabel="Cancel Reminder"
        isDestructive={true}
      />

    </div>
  );
}
