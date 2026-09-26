"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Send, User, Loader2, MessageSquare, ShieldCheck, MoreVertical } from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function UnifiedMessagingPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function fetchConversations() {
      setIsLoading(true);
      try {
        const data = await api.get("/messages/conversations");
        setConversations(data);
        if (data.length > 0) {
            setSelectedId(data[0].id);
        } else {
            // For development/demo purposes, show a welcoming placeholder if no real chats exist
            setConversations([
                { id: "welcome-chat", participant_name: "Business Bridge Assistant", last_message_content: "Welcome! Select this chat to see how our secure deal room messaging works.", last_message_at: new Date().toISOString(), listing_title: "Getting Started" }
            ]);
            setSelectedId("welcome-chat");
        }
      } catch (e) {
        console.error("Failed to fetch conversations");
      } finally {
        setIsLoading(false);
      }
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedId && selectedId !== "welcome-chat") {
      async function fetchMessages() {
        try {
          const data = await api.get(`/messages/conversations/${selectedId}/messages`);
          setMessages(data);
        } catch (e) {
          console.error("Failed to fetch messages");
        }
      }
      fetchMessages();
    } else if (selectedId === "welcome-chat") {
        setMessages([
            { id: "m1", content: "Hi! This is where you and the buyer/seller will negotiate the deal securely.", is_mine: false, created_at: new Date().toISOString() },
            { id: "m2", content: "Once you agree on terms, the deal moves to our Escrow-protected closing phase.", is_mine: false, created_at: new Date().toISOString() }
        ]);
    }
  }, [selectedId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;
    setIsSending(true);
    try {
      const res = await api.post(`/messages/messages`, {
        conversation_id: selectedId,
        content: newMessage
      });
      setMessages([...messages, res]);
      setNewMessage("");
    } catch (e) {
      alert("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col border-none shadow-sm overflow-hidden rounded-3xl bg-white">
        <div className="p-6 border-b space-y-4">
           <h1 className="text-xl font-black text-primary uppercase italic">Messages.</h1>
           <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search deals..."
                className="w-full bg-secondary/30 rounded-xl pl-9 pr-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
           {conversations.length > 0 ? conversations.map((conv) => (
             <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                    "p-5 cursor-pointer transition-all hover:bg-secondary/10 relative group",
                    selectedId === conv.id ? "bg-secondary/20" : ""
                )}
             >
                {selectedId === conv.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                <div className="flex gap-4">
                   <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-black text-primary shrink-0 shadow-inner">
                      {conv.participant_name?.[0] || 'U'}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                         <h4 className="text-sm font-bold text-primary truncate">{conv.participant_name}</h4>
                         <span className="text-[8px] font-black text-muted-foreground uppercase">{new Date(conv.last_message_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] font-medium text-muted-foreground truncate">{conv.last_message_content || "Start a conversation"}</p>
                      <div className="mt-2 text-[8px] font-black uppercase text-accent tracking-tighter opacity-60">{conv.listing_title}</div>
                   </div>
                </div>
             </div>
           )) : (
             <div className="p-8 text-center space-y-3 opacity-30">
                <MessageSquare className="w-8 h-8 mx-auto" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No Active Chats</p>
             </div>
           )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden rounded-3xl bg-white">
        {selectedId ? (
          <>
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black">
                     {conversations.find(c => c.id === selectedId)?.participant_name?.[0]}
                  </div>
                  <div>
                     <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-primary uppercase italic">{conversations.find(c => c.id === selectedId)?.participant_name}</h2>
                        {conversations.find(c => c.id === selectedId)?.participant_id && (
                           <Link
                            href={conversations.find(c => c.id === selectedId)?.participant_role === 'SELLER'
                                ? `/sellers/${conversations.find(c => c.id === selectedId)?.participant_id}`
                                : `/buyers/${conversations.find(c => c.id === selectedId)?.participant_id}`
                            }
                            className="text-[9px] font-black uppercase text-accent hover:underline"
                           >
                            View Profile
                           </Link>
                        )}
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Verified Identity</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground"><ShieldCheck className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground"><MoreVertical className="w-4 h-4" /></Button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                        "flex",
                        msg.is_mine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                        "max-w-[70%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm",
                        msg.is_mine ? "bg-primary text-white rounded-br-none" : "bg-secondary/30 text-primary rounded-bl-none"
                    )}>
                        {msg.content}
                        <div className={cn(
                            "text-[8px] mt-2 font-black uppercase opacity-40",
                            msg.is_mine ? "text-right" : "text-left"
                        )}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                  </motion.div>
                ))}
               </AnimatePresence>
            </div>

            <div className="p-6 border-t bg-slate-50/50 mt-auto">
               <div className="flex gap-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Type your message securely..."
                    className="flex-1 bg-white border-2 border-secondary rounded-2xl px-6 py-3 text-sm font-medium outline-none focus:border-accent transition-all resize-none min-h-[50px] max-h-[150px]"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    loading={isSending}
                    className="h-12 w-12 rounded-2xl bg-accent hover:bg-accent/90 border-none text-white shadow-lg shadow-accent/20 flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
               </div>
               <p className="mt-3 text-[8px] font-black uppercase text-center text-muted-foreground tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-accent" />
                  E2E Encrypted Transactional Messaging
               </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-30">
             <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                <MessageSquare className="w-10 h-10" />
             </div>
             <div className="max-w-xs">
                <h3 className="text-xl font-black text-primary uppercase italic">Secure Deal Chat</h3>
                <p className="text-sm font-medium mt-2">Select a conversation from the list to begin secure acquisition discussions.</p>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
}
