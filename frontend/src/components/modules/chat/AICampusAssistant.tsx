import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Calendar,
  Bell,
  BookOpen,
  User,
  Bot,
  HelpCircle
} from 'lucide-react';
import { ChatMessage } from '@/types';

interface AICampusAssistantProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  loading: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  voiceTranscript: string;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  onSpeakText: (text: string) => void;
  ttsEnabled: boolean;
  onToggleTts: () => void;
}

export function AICampusAssistant({
  messages,
  onSendMessage,
  loading,
  isListening,
  onToggleVoice,
  voiceTranscript,
  isSpeaking,
  onStopSpeaking,
  onSpeakText,
  ttsEnabled,
  onToggleTts,
}: AICampusAssistantProps) {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (voiceTranscript) {
      setInputText(voiceTranscript);
    }
  }, [voiceTranscript]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const q = inputText.trim();
    setInputText('');
    onSendMessage(q);
  };

  const handlePromptClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl bg-[#0f1422] border border-slate-800 shadow-sm overflow-hidden">
      
      {/* Assistant Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0a0d14]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white tracking-tight">AI Campus Assistant</h2>
              <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Bedrock Converse
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Natural-language and voice task orchestration</p>
          </div>
        </div>

        {/* TTS Toggle & Audio Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTts}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
              ttsEnabled
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={ttsEnabled ? 'Spoken responses enabled' : 'Spoken responses muted'}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px] font-medium">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30 animate-pulse"
            >
              Stop Audio
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Content */}
              <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {!isUser && msg.content && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-end">
                      <button
                        onClick={() => onSpeakText(msg.content)}
                        className="text-slate-400 hover:text-blue-300 p-0.5 rounded transition-colors text-[10px] flex items-center gap-1"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bedrock Executed Actions Summary */}
                {msg.executed_actions && msg.executed_actions.length > 0 && (
                  <div className="space-y-1.5 pt-0.5">
                    {msg.executed_actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5"
                      >
                        <div className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">
                          {act.tool === 'create_assignment' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          {act.tool === 'generate_study_plan' && <Calendar className="w-3.5 h-3.5 text-blue-400" />}
                          {act.tool === 'create_reminder' && <Bell className="w-3.5 h-3.5 text-amber-400" />}
                          {act.tool.includes('explain') && <BookOpen className="w-3.5 h-3.5 text-violet-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-100">{act.summary}</div>
                          {act.details?.title && (
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                              Record: <span className="text-slate-300">{act.details.title}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Missing Information Clarification */}
                {msg.action_required && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Please provide missing parameters to complete this task.</span>
                  </div>
                )}

                {/* Follow-up Suggested Action Pills */}
                {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggested_replies.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(sug)}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 border border-slate-700">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2.5">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0.15s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:0.3s]" />
              </div>
              <span className="text-[11px]">Evaluating academic services...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Live Voice Status Indicator */}
      {(isListening || isSpeaking) && (
        <div className="px-5 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-3">
          <div className="flex items-center gap-1 h-5">
            <span className="w-1 bg-blue-400 rounded-full soundwave-bar" />
            <span className="w-1 bg-violet-400 rounded-full soundwave-bar" />
            <span className="w-1 bg-sky-400 rounded-full soundwave-bar" />
            <span className="w-1 bg-blue-400 rounded-full soundwave-bar" />
            <span className="w-1 bg-violet-400 rounded-full soundwave-bar" />
          </div>
          <span className="text-[11px] font-medium text-slate-300">
            {isListening ? 'Listening for speech...' : 'Playing voice response...'}
          </span>
        </div>
      )}

      {/* Quick Prompts Carousel Bar */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0a0d14]/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold uppercase text-slate-500 shrink-0">Suggestions:</span>
        {[
          'Add Operating Systems assignment due tomorrow 5 PM',
          'Plan my study for 3 hours tonight',
          'Explain Virtual Memory in OS',
          'Quiz me on Database Normalization',
          'Remind me about the Physics midterm',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(prompt)}
            className="px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar with Prominent Voice Button */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-800 bg-[#0a0d14]">
        <div className="flex items-center gap-2">
          {/* Prominent Voice Assistant Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/20'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-blue-400 hover:text-blue-300'
            }`}
            title={isListening ? 'Stop recording' : 'Spoken Voice Assistant'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak a request (e.g. 'Add database assignment due tomorrow 5 PM')..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

    </div>
  );
}
