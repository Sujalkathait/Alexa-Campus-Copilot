import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  userName: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirmDelete,
  userName,
}: DeleteAccountModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const REQUIRED_PHRASE = 'DELETE';
  const isMatch = confirmationInput.trim() === REQUIRED_PHRASE;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatch) {
      setError(`Please type ${REQUIRED_PHRASE} exactly to confirm.`);
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete();
      setConfirmationInput('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmationInput('');
        setError(null);
        onClose();
      }}
      title="Delete Academic Account"
      description="Permanent account deletion and complete coursework data wipe."
    >
      <form onSubmit={handleDelete} className="space-y-4 text-xs">
        {/* Warning Banner - UI/UX Principle: Error Prevention & High Contrast Visual Hierarchy */}
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Warning: Irreversible Academic Data Erasure</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Deleting the account for <strong className="text-white">{userName}</strong> will permanently erase:
          </p>
          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
            <li>All tracked coursework, laboratory submissions, and assignments</li>
            <li>All personalized study schedules and calendar bookings</li>
            <li>All scheduled notifications and submission reminders</li>
            <li>All AI Campus Assistant chat history and conversation context</li>
          </ul>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-500/40 text-rose-300 text-[11px]">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-slate-300 font-medium">
            To confirm deletion, please type <strong className="font-mono text-rose-400">DELETE</strong> in the box below:
          </label>
          <input
            type="text"
            required
            value={confirmationInput}
            onChange={(e) => {
              setConfirmationInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Type DELETE to confirm"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-600 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono transition-colors"
          />
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setConfirmationInput('');
              setError(null);
              onClose();
            }}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!isMatch || isDeleting}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isMatch
                ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Erasing Account Data...' : 'Permanently Delete Account'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
