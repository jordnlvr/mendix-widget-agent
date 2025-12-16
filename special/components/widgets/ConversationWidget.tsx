
import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Note } from '../../types';

interface ConversationWidgetProps {
  messages: Note[];
  currentUserId?: string; // To determine alignment (Left vs Right)
  onSendMessage: (text: string) => void;
  height?: string;
  placeholder?: string;
  title?: string;
}

export const ConversationWidget: React.FC<ConversationWidgetProps> = ({ 
  messages, 
  currentUserId = 'John Doe', 
  onSendMessage,
  height = 'h-80',
  placeholder = "Type a message...",
  title = "Discussion History"
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="space-y-4">
       {title && (
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
             <MessageSquare size={14} /> {title}
          </h3>
       )}
       
       <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 ${height} flex flex-col shadow-sm overflow-hidden`}>
          {/* Scrollable Area - Note: flex-col-reverse puts the newest message (first in DOM) at the bottom */}
          {/* UPDATED: Used gap-6 instead of space-y-6 for reliable spacing in reverse flex */}
          <div className="flex-1 overflow-y-auto p-6 gap-6 custom-scrollbar flex flex-col-reverse bg-slate-50/50 dark:bg-slate-950/50">
             {messages.length > 0 ? (
                messages.map((msg) => {
                   // Check if the message is from the current user or an agent
                   const isMe = msg.author === currentUserId; 
                   
                   return (
                      <div key={msg.id} className={`flex gap-4 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
                         {/* Avatar */}
                         <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${isMe ? 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : 'bg-brand-primary text-white shadow-brand-primary/20'}`}>
                            {msg.authorInitials}
                         </div>
                         
                         {/* Bubble */}
                         <div className={`p-4 rounded-2xl text-sm shadow-sm backdrop-blur-md transition-all border ${
                            isMe 
                            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tr-none border-slate-200 dark:border-slate-700' 
                            : 'bg-brand-primary/10 dark:bg-brand-primary/20 text-slate-800 dark:text-slate-100 rounded-tl-none border-brand-primary/10 dark:border-brand-primary/20'
                         }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            <p className={`text-[10px] mt-2 font-medium ${isMe ? 'text-slate-400' : 'text-brand-primary/60 dark:text-brand-primary/80'}`}>{msg.date}</p>
                         </div>
                      </div>
                   )
                })
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                   <MessageSquare size={24} className="mb-2 opacity-50"/>
                   <p className="text-xs">No messages yet. Start the conversation!</p>
                </div>
             )}
          </div>
          
          {/* Input Area */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
             <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={placeholder}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
             />
             <button onClick={handleSend} className="p-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed" disabled={!inputText.trim()}>
                <Send size={18} />
             </button>
          </div>
       </div>
    </div>
  );
};
