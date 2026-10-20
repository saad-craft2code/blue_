"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AppShell, PageHeader } from "../app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "../avatar";
import { EmptyState, LoadingState } from "../empty-state";
import { useRouter } from "@/hooks/use-router";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Send, MessageSquare, ArrowLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessagesPage({ conversationId }: { conversationId?: string }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // List of conversations
  const { data: list, isLoading: listLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api<any>("/api/blue/conversations"),
    refetchInterval: 5000, // poll every 5s for new messages
  });

  // Active conversation
  const { data: active, isLoading: activeLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => api<any>(`/api/blue/conversations/${conversationId}`),
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  const send = useMutation({
    mutationFn: () =>
      api<any>(`/api/blue/conversations/${conversationId}`, {
        method: "POST",
        body: JSON.stringify({ body: draft }),
      }),
    onSuccess: () => {
      setDraft("");
      qc.invalidateQueries({ queryKey: ["conversation", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (e: any) => toast({ title: "Failed to send", description: e.message, variant: "destructive" }),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages?.length]);

  const filteredList = list?.data?.filter((c: any) => {
    if (!search) return true;
    return (c.other?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
           (c.subject ?? "").toLowerCase().includes(search.toLowerCase());
  }) ?? [];

  return (
    <AppShell variant="customer">
      <PageHeader title="Messages" description="Conversations tied to your jobs and direct messages with workers." />
      <div className="grid lg:grid-cols-[320px_1fr] gap-6 rounded-2xl border border-border bg-card overflow-hidden h-[calc(100vh-220px)] min-h-[500px]">
        {/* Conversation list */}
        <aside className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <LoadingState rows={3} className="p-3" />
            ) : !filteredList.length ? (
              <div className="p-4">
                <EmptyState icon={MessageSquare} title="No conversations" description="Messages start when a proposal is accepted." />
              </div>
            ) : (
              <ul>
                {filteredList.map((c: any) => (
                  <li key={c.id}>
                    <button
                      onClick={() => navigate({ name: "messages", conversationId: c.id })}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 w-full text-left hover:bg-muted transition",
                        conversationId === c.id && "bg-primary/5"
                      )}
                    >
                      <Avatar name={c.other?.name ?? "?"} src={c.other?.avatarUrl} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{c.other?.name ?? "Unknown"}</p>
                          {c.unreadCount > 0 && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.lastMessagePreview ?? c.subject ?? "No messages yet"}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Conversation view */}
        <section className="flex flex-col">
          {!conversationId ? (
            <div className="flex-1 grid place-items-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation from the list to view messages."
              />
            </div>
          ) : activeLoading ? (
            <LoadingState rows={4} className="p-3" />
          ) : !active ? (
            <div className="flex-1 grid place-items-center">
              <EmptyState icon={MessageSquare} title="Conversation not found" />
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b border-border px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate({ name: "messages" })} className="lg:hidden">
                  <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <Avatar name={active.other?.name ?? "?"} src={active.other?.avatarUrl} size="sm" />
                <div className="flex-1">
                  <p className="font-medium">{active.other?.name ?? "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {active.job ? `${active.job.title} · ${active.job.category.replace(/_/g, " ").toLowerCase()}` : active.subject ?? "Direct message"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {active.messages.map((m: any) => {
                  const mine = m.senderId === user?.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                          mine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-background border border-border rounded-bl-md"
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={cn("mt-0.5 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="border-t border-border p-3 flex items-center gap-2">
                <Input
                  placeholder="Type a message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (draft.trim()) send.mutate();
                    }
                  }}
                />
                <Button disabled={!draft.trim() || send.isPending} onClick={() => send.mutate()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
