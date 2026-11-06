import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatMessage } from '../../types';
import { PomodoroTimerWidget } from '../pomodoro/PomodoroTimerWidget';
import { SUBJECT_METADATA } from '../../utils/pomodoro';
import {
  X,
  Send,
  Bot,
  User,
  CheckCircle,
  Copy,
  ChevronRight,
} from 'lucide-react';

export const OpencodeDrawer: React.FC = () => {
  const { isOpencodeOpen, setIsOpencodeOpen, opencodeContextPrompt, addXp, nickname, pomodoro } = useApp();
  const lastCompletedSessionsRef = useRef<number>(pomodoro.completedSessions);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-initial',
      sender: 'assistant',
      text: `Hello ${nickname}! I am Opencode, your Edexcel IGCSE AI revision companion. Ask me to break down complex physics formulas, explain difficult chemistry mechanisms, or translate French phrasing with mark-scheme precision.`,
      timestamp: '19:40',
      suggestedFollowups: [
        'Explain Newton’s 2nd Law (F = ma)',
        'Why is thinking distance affected by driver fatigue?',
        'How to structure a 6-mark French response',
        'Explain terminal velocity step-by-step',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update initial message greeting when nickname changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].id === 'msg-initial') {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          text: `Hello ${nickname}! I am Opencode, your Edexcel IGCSE AI revision companion. Ask me to break down complex physics formulas, explain difficult chemistry mechanisms, or translate French phrasing with mark-scheme precision.`,
        };
        return updated;
      }
      return prev;
    });
  }, [nickname]);

  // When context prompt is provided from external click
  useEffect(() => {
    if (opencodeContextPrompt) {
      handleUserSubmit(opencodeContextPrompt);
    }
  }, [opencodeContextPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Congratulate student when a pomodoro focus session completes
  useEffect(() => {
    if (pomodoro.completedSessions > lastCompletedSessionsRef.current) {
      lastCompletedSessionsRef.current = pomodoro.completedSessions;
      const subMeta = SUBJECT_METADATA[pomodoro.subjectId] || SUBJECT_METADATA.physics;
      const celebrationMsg: ChatMessage = {
        id: `bot-pomodoro-${Date.now()}`,
        sender: 'assistant',
        text: `🎯 Outstanding discipline, ${nickname}! You finished a revision session on ${subMeta.name} (${subMeta.code}).\n\nTake your scheduled break to let the concepts consolidate. When you return, ask me any exam questions or formula derivations from that unit!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowups: [
          `Quiz me on 3 Edexcel ${subMeta.name} questions`,
          `What are the most common exam traps in ${subMeta.name}?`,
          `Give me a 60-second formula checklist`,
        ],
      };
      setMessages((prev) => [...prev, celebrationMsg]);
    }
  }, [pomodoro.completedSessions, pomodoro.subjectId, nickname]);

  const quickPrompts = [
    'Explain step-by-step',
    'Common Edexcel misconceptions',
    'Generate 3-mark scheme checklist',
    'Break down equation variables',
  ];

  const handleUserSubmit = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate intelligent tutor response formatted for Edexcel IGCSE and addressed to student's nickname
    setTimeout(() => {
      let responseText = '';
      let equationCallout = undefined;
      const lower = queryText.toLowerCase();

      if (lower.includes('newton') || lower.includes('f = ma') || lower.includes('force')) {
        equationCallout = 'F = m × a  (Resultant Force = mass × acceleration)';
        responseText =
          `Here is the Edexcel IGCSE breakdown for you, ${nickname}:\n\n1. Core Principle: Acceleration is directly proportional to resultant force and inversely proportional to mass.\n2. Key Mark-Scheme Detail: Always calculate the NET (resultant) force first before applying F = ma (e.g., Thrust - Drag = Resultant Force).\n3. Units: Force (N), Mass (kg), Acceleration (m/s²).`;
      } else if (lower.includes('thinking') || lower.includes('stopping') || lower.includes('friction')) {
        responseText =
          `Stopping Distance Analysis for your Edexcel Paper, ${nickname}:\n\n• Stopping Distance = Thinking Distance + Braking Distance\n• Thinking Distance depends strictly on driver factors: Tiredness, Alcohol/Drugs, Distractions, Vehicle Speed.\n• Braking Distance depends strictly on mechanical/environmental factors: Road surface (ice/wet), Brake wear, Tire tread, Mass of car, Vehicle Speed.\n\n*Examiner Trap*: "Speed" affects BOTH thinking and braking distance!`;
      } else if (lower.includes('kinematics') || lower.includes('velocity') || lower.includes('v = u + at')) {
        equationCallout = 'v = u + at  |  v² = u² + 2as  |  s = ½(u + v)t';
        responseText =
          `Step-by-Step Kinematics Strategy for ${nickname}:\n1. Write down known variables: u (initial), v (final), a (acceleration), s (displacement), t (time).\n2. Select the single equation containing your target variable without unknown parameters.\n3. Verify sign convention: deceleration or falling against gravity (g = -9.8 or -10 m/s²) must have consistent signs.`;
      } else {
        responseText = `Great inquiry on ${queryText}, ${nickname}! In Edexcel IGCSE mark schemes, examiners look for precise scientific terminology, correct SI units, and explicit mention of underlying physical laws rather than colloquial descriptions.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        equationCallout,
        suggestedFollowups: [
          'Show an Edexcel mark scheme example',
          'What are common student errors here?',
          'Give me a 2-minute quick check',
        ],
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      addXp(15);
    }, 800);
  };

  if (!isOpencodeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setIsOpencodeOpen(false)}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md h-full theme-page border-l theme-border shadow-2xl flex flex-col z-10">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b theme-border theme-card">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border theme-border theme-subtle flex items-center justify-center theme-text-primary">
              <Bot className="w-4 h-4 theme-accent-text" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold theme-text-primary">Opencode AI</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold border theme-border theme-subtle theme-text-secondary">
                  TUTOR v2.4
                </span>
                <span className="text-[10px] font-mono theme-text-muted">
                  · for {nickname}
                </span>
              </div>
              <span className="text-[11px] theme-text-muted font-mono">
                Edexcel IGCSE Grounded
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpencodeOpen(false)}
            aria-label="Close AI Companion Drawer"
            className="p-1 rounded theme-text-muted hover:theme-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Persistent Pomodoro Focus Study Timer Widget */}
        <PomodoroTimerWidget onAskOpencodePrompt={handleUserSubmit} />

        {/* Quick prompt chips bar */}
        <div className="px-4 py-2 border-b theme-border theme-subtle flex items-center gap-2 text-xs flex-wrap">
          <span className="theme-text-muted font-mono text-[11px] shrink-0">Prompts:</span>
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleUserSubmit(p)}
              className="px-2 py-0.5 rounded border theme-border theme-card theme-text-secondary hover:theme-text-primary text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                    isBot
                      ? 'border theme-border theme-subtle theme-text-primary'
                      : 'theme-accent-btn shadow-xs'
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-lg p-3 space-y-2 text-xs leading-relaxed ${
                    isBot
                      ? 'theme-card border theme-border theme-text-primary'
                      : 'theme-accent-btn shadow-xs'
                  }`}
                >
                  {/* Equation highlight box if present */}
                  {msg.equationCallout && (
                    <div className="p-2 rounded border theme-border theme-subtle theme-text-primary font-mono text-[11px] select-all flex items-center justify-between gap-2">
                      <span>{msg.equationCallout}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.equationCallout || '')}
                        title="Copy equation"
                        className="p-0.5 hover:opacity-70 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="whitespace-pre-line font-sans">{msg.text}</div>

                  <div
                    className={`text-[10px] font-mono text-right opacity-60`}
                  >
                    {msg.timestamp}
                  </div>

                  {/* Followup suggestions */}
                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="pt-2 border-t theme-border space-y-1">
                      <span className="text-[10px] font-mono uppercase opacity-75 font-semibold block">
                        Suggested Inquiries:
                      </span>
                      {msg.suggestedFollowups.map((followup) => (
                        <button
                          key={followup}
                          onClick={() => handleUserSubmit(followup)}
                          className="w-full text-left p-1.5 rounded border theme-border theme-subtle hover:opacity-80 text-[11px] font-mono theme-text-primary flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span>{followup}</span>
                          <ChevronRight className="w-3 h-3 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 items-center theme-text-muted text-xs font-mono">
              <div className="w-6 h-6 rounded border theme-border theme-subtle flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 theme-accent-text" />
              </div>
              <span>Opencode is synthesizing mark scheme insights for {nickname}...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t theme-border theme-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserSubmit(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Opencode for ${nickname}...`}
              className="flex-1 px-3 py-2 rounded border theme-border theme-input text-xs theme-text-primary focus:outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-3.5 py-2 rounded theme-accent-btn text-xs font-mono font-medium disabled:opacity-40 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Send className="w-3 h-3" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] font-mono theme-text-muted">
            <span>Asking questions earns +15 XP</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 theme-accent-text" />
              <span>IGCSE Certified Grounding</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
