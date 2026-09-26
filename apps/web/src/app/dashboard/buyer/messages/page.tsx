"use client";

import { useState } from "react";
import { ConversationList } from "@/components/messaging/conversation-list";
import { MessageThread } from "@/components/messaging/message-thread";
import { Card } from "@/components/ui/card";
import { useMessaging } from "@/hooks/use-messaging";
import { Loader2 } from "lucide-react";

export default function BuyerMessagesPage() {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    isLoading,
    error: messagingError
  } = useMessaging();

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Map API data to component props
  const mappedConversations = conversations.map(c => ({
    id: c.id,
    subject: c.subject || "No subject",
    lastMessage: "...", // In a real app, you'd fetch the last message snippet
    timestamp: new Date(c.last_message_at),
    unread: false,
    listingTitle: c.listing_title || "General Inquiry",
  }));

  const mappedMessages = messages.map(m => ({
    id: m.id,
    content: m.content,
    senderName: m.is_system_message ? "System" : "User",
    timestamp: new Date(m.created_at),
    isMe: true, // This needs current_user check, but for now we'll assume 'Me'
    isSystem: m.is_system_message,
  }));

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">Messages.</h1>
      </div>

      {messagingError && (
        <div className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-xs font-bold uppercase tracking-widest">
           {messagingError}
        </div>
      )}

      <Card className="flex-1 overflow-hidden flex shadow-2xl border-none rounded-3xl">
        <div className="w-80 shrink-0 bg-slate-50/50">
          <ConversationList
            conversations={mappedConversations}
            activeId={activeConversationId || undefined}
            onSelect={setActiveConversationId}
          />
        </div>
        <div className="flex-1">
          {activeConversation ? (
            <MessageThread
              messages={mappedMessages}
              title={activeConversation.listing_title || "Conversation"}
              onSend={sendMessage}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center opacity-20">
                 <Loader2 className="w-8 h-8" />
              </div>
              <p className="font-bold uppercase text-[10px] tracking-widest">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
