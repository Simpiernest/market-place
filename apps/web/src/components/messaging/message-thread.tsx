"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, ShieldCheck, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  senderName: string;
  timestamp: Date;
  isMe: boolean;
  isSystem?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  title: string;
  onSend: (content: string) => void;
}

export function MessageThread({ messages, title, onSend }: MessageThreadProps) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (content.trim()) {
      onSend(content);
      setContent("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-sm font-bold text-primary truncate">{title}</h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Active Deal</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                "flex flex-col max-w-[80%]",
                msg.isMe ? "ml-auto items-end" : "items-start",
                msg.isSystem ? "max-w-full w-full items-center text-center my-4" : ""
                )}
            >
                {msg.isSystem ? (
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary/30 px-3 py-1 rounded-full">
                    {msg.content}
                </div>
                ) : (
                <>
                    <div className="flex items-center gap-2 mb-1">
                    {!msg.isMe && (
                        <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                        </div>
                    )}
                    <span className="text-[10px] font-bold text-muted-foreground">
                        {msg.senderName}
                    </span>
                    </div>
                    <div
                    className={cn(
                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                        msg.isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-secondary text-primary rounded-tl-none"
                    )}
                    >
                    {msg.content}
                    </div>
                </>
                )}
            </motion.div>
            ))}
        </AnimatePresence>

        {isTyping && (
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-muted-foreground bg-secondary/20 w-fit px-3 py-1.5 rounded-full"
            >
                <div className="flex gap-1">
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="h-1 w-1 bg-current rounded-full" />
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-1 w-1 bg-current rounded-full" />
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-1 w-1 bg-current rounded-full" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Typing...</span>
            </motion.div>
        )}
      </div>

      <div className="p-4 border-t bg-secondary/10">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant, className }: any) {
  return (
    <div className={cn("px-2 py-0.5 rounded text-xs font-bold uppercase", className)}>
      {children}
    </div>
  )
}
