"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  subject: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  listingTitle: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="p-4 border-b bg-secondary/10">
        <h2 className="text-lg font-bold text-primary">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                "w-full text-left p-4 border-b transition-colors hover:bg-secondary/50",
                activeId === conv.id ? "bg-secondary/80" : "",
                conv.unread ? "bg-accent/5" : ""
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={cn("text-sm font-bold truncate pr-2", conv.unread ? "text-primary" : "text-muted-foreground")}>
                  {conv.listingTitle}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(conv.timestamp, { addSuffix: true })}
                </span>
              </div>
              <div className="text-xs text-primary font-medium truncate mb-1">{conv.subject}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{conv.lastMessage}</div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
