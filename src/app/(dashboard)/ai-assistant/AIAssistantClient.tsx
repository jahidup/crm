'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Copy, 
  Check, 
  RotateCcw,
  Users,
  Briefcase,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';

interface AIAssistantClientProps {
  leads: any[];
}

export default function AIAssistantClient({ leads }: AIAssistantClientProps) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Load selected lead context
  useEffect(() => {
    if (!selectedLeadId) {
      setSelectedLead(null);
      setChatMessages([]);
      return;
    }
    
    const lead = leads.find(l => l._id === selectedLeadId);
    setSelectedLead(lead || null);
    setChatMessages([]);
    setIsAiLoading(true);

    // Fetch existing AIConversation history for this lead
    fetch(`/api/ai/history?leadId=${selectedLeadId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setChatMessages(data);
        } else {
          // Welcome message
          setChatMessages([
            {
              sender: 'ai',
              content: `### Strategic Advisor Seeding Complete
I have loaded the full profile context for **${lead?.name} (${lead?.company})**. 

Choose any of the quick-profile strategy buttons on the left sidebar to generate tailored sales assets, or write custom questions below.`,
              timestamp: new Date()
            }
          ]);
        }
      })
      .catch(() => {
        toast.error('Failed to load history');
      })
      .finally(() => {
        setIsAiLoading(false);
      });
  }, [selectedLeadId, leads]);

  // Handle Advisor action button
  const handleQuickAction = async (action: string) => {
    if (!selectedLeadId) {
      toast.error('Context Missing', 'Please select a client lead profile first.');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLeadId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'user', content: `[Execute Action]: ${action.toUpperCase()}`, timestamp: new Date() },
          { sender: 'ai', content: data.text, timestamp: new Date() },
        ]);
        toast.success('Action Generated', 'Asset has been successfully compiled.');
      } else {
        toast.error('AI Failure', data.error);
      }
    } catch (e) {
      toast.error('Connection failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Custom Message Submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      toast.error('Context Missing', 'Please select a client lead profile first.');
      return;
    }
    if (!inputMessage.trim() || isAiLoading) return;

    const msg = inputMessage.trim();
    setInputMessage('');
    setChatMessages((prev) => [...prev, { sender: 'user', content: msg, timestamp: new Date() }]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLeadId, message: msg }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages((prev) => [...prev, { sender: 'ai', content: data.text, timestamp: new Date() }]);
      } else {
        toast.error('AI error', data.error);
      }
    } catch (e) {
      toast.error('AI response error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Copy advisor response to clipboard
  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    toast.success('Copied', 'Consultant notes copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Chat formatter for Markdown text
  const formatMarkdown = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      if (trimmed.startsWith('###')) {
        return <h4 key={idx} className="text-xs font-bold text-white mt-4 mb-2 tracking-wider uppercase border-b border-zinc-900 pb-1">{trimmed.replace('###', '')}</h4>;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <p key={idx} className="text-xs font-semibold text-blue-400 mt-2">{trimmed.replace(/\*\*/g, '')}</p>;
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <li key={idx} className="text-xs text-zinc-300 ml-4 list-disc mt-1.5 leading-relaxed">
            {trimmed.substring(1).trim().replace(/\*\*(.*?)\*\*/g, '$1')}
          </li>
        );
      }
      if (trimmed === '') return <div key={idx} className="h-2" />;

      const inlineBoldParsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p 
          key={idx} 
          className="text-xs text-zinc-400 mt-1.5 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: inlineBoldParsed }}
        />
      );
    });
  };

  // AI Actions List
  const aiActionsList = [
    { id: 'analyze', text: 'Business Analysis' },
    { id: 'strategy', text: 'Sales Strategy' },
    { id: 'outreach', text: 'Outreach Templates' },
    { id: 'proposal', text: 'Proposal Draft' },
    { id: 'budget', text: 'Estimate Budget' },
    { id: 'meeting', text: 'Meeting Prep' },
    { id: 'score', text: 'Lead Score' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-xl text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Dedicated AI Assistant</h2>
            <p className="text-xs text-zinc-500">Auto-inject lead records into Gemini to create outreach strategies.</p>
          </div>
        </div>

        {/* Lead Selector */}
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-2 border border-zinc-900 rounded-xl max-w-xs w-full">
          <Users size={14} className="text-zinc-500 shrink-0" />
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="w-full bg-transparent text-xs text-white border-none outline-none focus:ring-0 cursor-pointer"
          >
            <option value="" className="bg-zinc-950">-- Select Lead Profile --</option>
            {leads.map(lead => (
              <option key={lead._id} value={lead._id} className="bg-zinc-950">
                {lead.name} ({lead.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main split dashboard panel */}
      {selectedLead ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch min-h-[500px]">
          {/* LEFT SIDE: Active profile details & Quick actions (4 cols) */}
          <div className="xl:col-span-4 space-y-4 flex flex-col justify-start">
            {/* Lead context summary */}
            <div className="p-5 bg-zinc-900/10 border border-zinc-900 rounded-2xl text-xs space-y-3">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Context Loaded</span>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedLead.name}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{selectedLead.company}</p>
                </div>
                <span className="text-[8px] bg-blue-950/40 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full font-bold uppercase">
                  {selectedLead.status}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal line-clamp-3">
                {selectedLead.business?.description || 'No description provided.'}
              </p>
            </div>

            {/* Quick Actions List */}
            <div className="p-5 bg-zinc-950/30 border border-zinc-900 rounded-2xl flex-1 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-4">Quick Strategy Commands</span>
                <div className="grid grid-cols-1 gap-2">
                  {aiActionsList.map(act => (
                    <button
                      key={act.id}
                      onClick={() => handleQuickAction(act.id)}
                      disabled={isAiLoading}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-left text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{act.text}</span>
                      <Sparkles size={11} className="text-blue-500" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Large chat interface (8 cols) */}
          <div className="xl:col-span-8 flex flex-col justify-start">
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 h-[550px] xl:h-full flex flex-col justify-between">
              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto py-2 space-y-4 scrollbar-thin scroll-smooth pr-1">
                {chatMessages.map((msg, index) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 border text-xs shadow-md relative group ${
                        isUser
                          ? 'bg-blue-600/10 border-blue-500/20 text-white rounded-tr-none'
                          : 'bg-zinc-900/40 border-zinc-900 text-zinc-300 rounded-tl-none'
                      }`}>
                        {isUser ? (
                          <p className="text-[10px] text-zinc-400 font-bold mb-1.5 tracking-wider uppercase font-mono">AE REP</p>
                        ) : (
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-blue-500 font-bold tracking-wider uppercase flex items-center gap-1">
                              <Sparkles size={10} className="animate-pulse" /> Gemini Consultant
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyText(msg.content, `${index}`)}
                                className="p-1 hover:bg-zinc-950 text-zinc-500 hover:text-white rounded transition-colors"
                              >
                                {copiedId === `${index}` ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          {isUser ? <p className="leading-relaxed font-semibold">{msg.content}</p> : formatMarkdown(msg.content)}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-900/40 border-zinc-900 max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 border text-xs text-zinc-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-100" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce delay-200" />
                      <span className="text-[10px] text-zinc-500 font-medium font-mono ml-1 uppercase">Generating advice...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-zinc-900">
                <input
                  type="text"
                  placeholder={`Ask anything about ${selectedLead.name}'s account...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-blue-500 text-xs text-white rounded-xl px-3 py-2 outline-none"
                  disabled={isAiLoading}
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !inputMessage.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl transition-all shadow-md cursor-pointer shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-16 rounded-xl border border-zinc-900 bg-zinc-950/5 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-zinc-900/20 border border-zinc-900 rounded-full text-zinc-600 mb-4">
            <Bot size={36} />
          </div>
          <h3 className="text-base font-bold text-white">No Context Loaded</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-2">
            Select an active client lead profile in the top right selector to inject their business history into the strategic advisor thread.
          </p>
        </div>
      )}
    </div>
  );
}
