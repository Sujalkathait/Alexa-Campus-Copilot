import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Assignment, AssignmentFormData, Priority } from '@/types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  initialData?: Assignment | null;
}

export function AssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AssignmentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      const d = new Date(initialData.due_at);
      setDueDate(d.toISOString().slice(0, 16));
      setEstimatedMinutes(initialData.estimated_minutes || 60);
      setPriority(initialData.priority || 'MEDIUM');
    } else {
      setTitle('');
      setDescription('');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);
      setDueDate(tomorrow.toISOString().slice(0, 16));
      setEstimatedMinutes(60);
      setPriority('MEDIUM');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        due_at: new Date(dueDate).toISOString(),
        estimated_minutes: Number(estimatedMinutes),
        priority,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Assignment' : 'Create Assignment'}
      description="Record academic deadlines, syllabus details, and effort estimations."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Assignment Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. CS301 Operating Systems Lab 2"
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Description / Syllabus Scope</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional instructions, rubrics, or lecture references..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Due Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Estimated Effort (Minutes)</label>
            <input
              type="number"
              min="10"
              max="1440"
              step="15"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Priority Weight</label>
          <div className="grid grid-cols-3 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  priority === p
                    ? p === 'HIGH'
                      ? 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                      : p === 'MEDIUM'
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold shadow-sm transition-all"
          >
            {initialData ? 'Update Assignment' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
