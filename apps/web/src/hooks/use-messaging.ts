"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_system_message: boolean;
}

export interface Conversation {
  id: string;
  listing_id?: string;
  subject?: string;
  last_message_at: string;
  listing_title?: string; // Optional expansion from API
}

export function useMessaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get("/messages/conversations");
      setConversations(data);
    } catch (e: any) {
      setError(e.message || "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await api.get(`/messages/conversations/${conversationId}/messages`);
      setMessages(data);
    } catch (e: any) {
      setError(e.message || "Failed to load messages");
    }
  }, []);

  const sendMessage = async (content: string) => {
    if (!activeConversationId) return;

    try {
      const newMessage = await api.post("/messages/messages", {
        conversation_id: activeConversationId,
        content
      });
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (e: any) {
      setError(e.message || "Failed to send message");
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);

      // Polling for new messages in V1 (Real-time WebSockets later)
      const interval = setInterval(() => {
        fetchMessages(activeConversationId);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [activeConversationId, fetchMessages]);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    messages,
    sendMessage,
    isLoading,
    error,
    refreshConversations: fetchConversations
  };
}
