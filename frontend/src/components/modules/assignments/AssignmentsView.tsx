import React, { useState } from 'react';
import {
  Search,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Assignment, AssignmentFormData, Priority, AssignmentStatus } from '@/types';
import { AssignmentModal } from './AssignmentModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface AssignmentsViewProps {
  assignments: Assignment[];
  loading: boolean;
  onCreateAssignment: (data: AssignmentFormData) => Promise<void>;
  onUpdateAssignment: (id: string, data: Partial<AssignmentFormData>) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
  onScheduleForTask?: (task: Assignment) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export function AssignmentsView({
  assignments,
  loading,
  onCreateAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onScheduleForTask,
  isCreateModalOpen,
  setIsCreateModalOpen,
}: AssignmentsViewProps) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.description && a.description.toLowerCase().includes(search.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await onDeleteAssignment(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Coursework & Assignments</h1>
          <p className="text-xs text-slate-400">Track deadlines, syllabus details, and prioritize academic workloads</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Toolbar: Search, Filters & View Toggle */}
      <div className="p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coursework..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Priority:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                priorityFilter === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Status:</span>
          {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
            title="Card view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
            title="Table view"
          >
            <ListIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0f1422] border border-slate-800 text-center text-slate-400">
          <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-medium text-slate-300">No assignments match your filter.</p>
          <p className="text-xs text-slate-500 mt-0.5">Try resetting the filter criteria or click "New Assignment".</p>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const isOverdue = task.is_overdue;
            const hoursRemaining = task.hours_remaining;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-[#0f1422] border flex flex-col justify-between transition-colors ${
                  isCompleted
                    ? 'border-slate-800/60 opacity-70'
                    : isOverdue
                    ? 'border-rose-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {task.priority} Priority
                    </span>

                    {isCompleted ? (
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        COMPLETED
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                        OVERDUE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {hoursRemaining != null && hoursRemaining <= 48
                          ? `Due in ${Math.round(hoursRemaining)}h`
                          : new Date(task.due_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold text-slate-100 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {task.estimated_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(task.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        onUpdateAssignment(task.id, {
                          status: isCompleted ? 'PENDING' : 'COMPLETED',
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isCompleted ? 'Pending' : 'Complete'}</span>
                    </button>

                    {!isCompleted && onScheduleForTask && (
                      <button
                        onClick={() => onScheduleForTask(task)}
                        className="px-2 py-1 rounded-lg text-[11px] text-blue-300 hover:bg-blue-500/10 border border-blue-500/20 transition-colors"
                      >
                        Plan Study
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingAssignment(task)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(task.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-[#0f1422] border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0a0d14] text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Assignment Title</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Effort</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((task) => (
                <tr key={task.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div className="font-semibold">{task.title}</div>
                    {task.description && <div className="text-[11px] text-slate-500 truncate max-w-xs">{task.description}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-300'
                          : task.priority === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {new Date(task.due_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{task.estimated_minutes}m</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-slate-300">{task.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingAssignment(task)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(task.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      <AssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateAssignment}
      />

      {/* Edit Modal */}
      {editingAssignment && (
        <AssignmentModal
          isOpen={Boolean(editingAssignment)}
          onClose={() => setEditingAssignment(null)}
          initialData={editingAssignment}
          onSubmit={async (data) => {
            await onUpdateAssignment(editingAssignment.id, data);
            setEditingAssignment(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? Any associated study sessions or reminders may also be removed."
        confirmLabel="Delete"
        isDestructive={true}
      />

    </div>
  );
}
