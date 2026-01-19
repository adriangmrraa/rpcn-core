'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Workspace } from '@/components/Workspace';
import { CommandCenter } from '@/components/CommandCenter';
import { ThoughtSpace, ThoughtStep } from '@/components/ThoughtSpace';
import { MemoryGraph } from '@/components/MemoryGraph';
import { CodeArtifact } from '@/components/CodeArtifact';
import { LiveTerminal } from '@/components/LiveTerminal';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: string[];
  thoughts?: ThoughtStep[];
}

export default function NeuralHub() {
  const { rightPaneMode, setRightPaneMode, setRightPaneContent, setIsThinking } = useUIStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Neural link established. Cognitive Workspace ready.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThoughts, setCurrentThoughts] = useState<ThoughtStep[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync isThinking to store
  useEffect(() => {
    setIsThinking(isLoading);
  }, [isLoading, setIsThinking]);

  // Default to Graph Mode for Glass Box UX
  useEffect(() => {
    setRightPaneMode('graph');
    return () => setRightPaneContent(null);
  }, [setRightPaneMode, setRightPaneContent]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentThoughts]);

  const handleSendMessage = async (userMessage: string, attachments?: string[]) => {
    if (isLoading) return;

    setMessages(prev => [...prev, { role: 'user', content: userMessage, attachments }]);
    setIsLoading(true);
    setCurrentThoughts([]);

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: userMessage,
          user_id: 'default_user',
          images: attachments
        }),
      });

      if (!response.body) throw new Error('No body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantResponse = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);

        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'thought' || data.type === 'tool_use') {
                setCurrentThoughts(prev => [...prev, data]);
              } else if (data.type === 'result') {
                assistantResponse = data.output;
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: assistantResponse,
                  thoughts: [...currentThoughts]
                }]);
              } else if (data.type === 'error') {
                setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.message}` }]);
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', line);
            }
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Neural connection disrupted.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#080808]">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-14 space-y-10 scrollbar-hide">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex flex-col gap-3 max-w-[85%]",
              m.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            {m.attachments && m.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-1">
                {m.attachments.map((at, idx) => (
                  <img key={idx} src={at} alt="upload" className="h-20 w-20 object-cover rounded-lg border border-border/50" />
                ))}
              </div>
            )}
            <div className={cn(
              "rounded-2xl px-6 py-4 text-sm leading-relaxed shadow-sm transition-all",
              m.role === 'user'
                ? "bg-foreground/5 text-foreground border border-border/50"
                : "bg-black/40 border border-white/5 text-foreground/90 font-medium"
            )}>
              {m.role === 'assistant' && m.thoughts && m.thoughts.length > 0 && (
                <div className="mb-4">
                  <ThoughtSpace steps={m.thoughts} />
                </div>
              )}
              {m.content}
            </div>
          </motion.div>
        ))}

        {/* Live Thinking Indicator */}
        <AnimatePresence>
          {(isLoading || currentThoughts.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-3 max-w-[85%] items-start"
            >
              <div className="rounded-2xl px-6 py-4 text-sm bg-black/40 border border-white/5 w-full">
                <header className="flex items-center gap-2 mb-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-agent-thinking animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-agent-thinking">TRM Processing</span>
                </header>
                <ThoughtSpace steps={currentThoughts} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Floating Input Area */}
      <div className="border-t border-border/20 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl">
          <CommandCenter
            onSend={handleSendMessage}
            disabled={isLoading}
            isThinking={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
