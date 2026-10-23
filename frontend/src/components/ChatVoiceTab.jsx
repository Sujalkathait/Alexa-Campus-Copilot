import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Calendar,
  Bell,
  BookOpen,
  HelpCircle,
  RotateCcw,
  User,
  Bot
} from 'lucide-react';

export function ChatVoiceTab({
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
}) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  // Sync speech transcript into input if user spoke
  useEffect(() => {
    if (voiceTranscript) {
      setInputText(voiceTranscript);
    }
  }, [voiceTranscript]);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const query = inputText.trim();
    if (!query || loading) return;
    setInputText('');
    onSendMessage(query);
  };

  const handlePromptClick = (prompt) => {
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-[78vh] rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Alexa+ Conversational Copilot</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                Bedrock Converse Live
              </span>
            </div>
            <p className="text-xs text-slate-400">Natural-language and voice academic orchestration</p>
          </div>
        </div>

        {/* Header Voice & Speaker Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTts}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              ttsEnabled
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={ttsEnabled ? 'Speech Output Enabled (Click to Mute)' : 'Speech Output Muted (Click to Enable)'}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold animate-pulse"
            >
              Stop Audio
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-purple-600 text-white'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/90 border border-slate-700/80 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Speaker button on assistant message */}
                  {!isUser && msg.content && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-end">
                      <button
                        onClick={() => onSpeakText(msg.content)}
                        className="text-slate-400 hover:text-purple-300 p-1 rounded transition-colors text-xs flex items-center gap-1"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Executed Action Cards (Bedrock Tool Execution) */}
                {msg.executed_actions && msg.executed_actions.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {msg.executed_actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3 shadow-md"
                      >
                        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                          {act.tool === 'create_assignment' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {act.tool === 'generate_study_plan' && <Calendar className="w-4 h-4 text-indigo-400" />}
                          {act.tool === 'create_reminder' && <Bell className="w-4 h-4 text-amber-400" />}
                          {act.tool === 'explain_academic_concept' && <BookOpen className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{act.summary}</div>
                          {act.details && act.details.title && (
                            <div className="text-slate-400 text-[11px] mt-0.5">
                              Subject: <span className="text-slate-300">{act.details.title}</span> | Status:{' '}
                              <span className="text-emerald-400 uppercase font-semibold">{act.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Required Clarification Warning */}
                {msg.action_required && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Please provide the missing deadline information to proceed with creation.</span>
                  </div>
                )}

                {/* Suggested Follow-up Pills */}
                {msg.suggested_replies && msg.suggested_replies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggested_replies.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(sug)}
                        className="px-2.5 py-1 rounded-full text-xs bg-slate-800/80 hover:bg-purple-600/30 border border-slate-700/80 hover:border-purple-500/40 text-purple-200 transition-colors"
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
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-sm flex items-center gap-3">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs text-slate-400">Bedrock AI is evaluating academic tools...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Voice Waveform Live Indicator (When actively speaking or listening) */}
      {(isListening || isSpeaking) && (
        <div className="px-6 py-2 bg-slate-950/90 border-t border-purple-500/30 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 h-7">
            <span className="w-1 bg-purple-400 rounded-full soundwave-bar"></span>
            <span className="w-1 bg-indigo-400 rounded-full soundwave-bar"></span>
            <span className="w-1 bg-sky-400 rounded-full soundwave-bar"></span>
            <span className="w-1 bg-purple-400 rounded-full soundwave-bar"></span>
            <span className="w-1 bg-indigo-400 rounded-full soundwave-bar"></span>
            <span className="w-1 bg-sky-400 rounded-full soundwave-bar"></span>
          </div>
          <span className="text-xs font-semibold text-purple-300">
            {isListening ? 'Listening to speech...' : 'Speaking response aloud...'}
          </span>
        </div>
      )}

      {/* Suggested Quick Prompt Chips (above input) */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Try asking:</span>
        {[
          'Add Operating Systems assignment due tomorrow 5 PM',
          'Plan my study for 3 hours tonight',
          'Explain Virtual Memory in OS',
          'Quiz me on Database Normalization',
          'Remind me about the Physics midterm',
        ].map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handlePromptClick(promptText)}
            className="px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-center gap-2">
          {/* Microphone Voice Button */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-3 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-purple-400 hover:text-purple-300'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to talk (Speech Recognition)'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or speak a request (e.g. 'Add database assignment due tomorrow 5 PM', 'Plan 2 hrs of study')..."
            className="flex-1 bg-slate-900/90 border border-slate-700/80 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            disabled={loading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

    </div>
  );
}
