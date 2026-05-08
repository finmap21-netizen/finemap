import { useState, useRef, useEffect } from "react";
import {
  useCreateAnthropicConversation,
  useSendAnthropicMessage,
  useGetAnthropicConversation,
  getGetAnthropicConversationQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, X, Send, Loader2, Bot, RefreshCw } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const authenticated = isAuthenticated();

  const createConversation = useCreateAnthropicConversation();
  const sendMessage = useSendAnthropicMessage();

  const { data: conversation, isLoading: loadingConv } = useGetAnthropicConversation(
    conversationId ?? 0,
    { query: { enabled: !!conversationId, refetchInterval: false } }
  );

  const messages = conversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = async () => {
    setIsCreating(true);
    try {
      const conv = await createConversation.mutateAsync({
        data: { title: "محادثة ضريبية" },
      });
      setConversationId(conv.id);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    if (!conversationId) {
      await startConversation();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || sendMessage.isPending) return;
    const text = input.trim();
    setInput("");
    await sendMessage.mutateAsync(
      { id: conversationId, data: { content: text } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetAnthropicConversationQueryKey(conversationId),
          });
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    setConversationId(null);
    await startConversation();
  };

  if (!authenticated) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end gap-3" dir="rtl">
      {open && (
        <div className="w-[360px] h-[520px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold text-sm">المستشار الضريبي الذكي</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-white/20"
                onClick={handleReset}
                title="محادثة جديدة"
              >
                <RefreshCw size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground hover:bg-white/20"
                onClick={() => setOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {(isCreating || loadingConv) && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <Loader2 size={32} className="animate-spin text-primary" />
                <span className="text-sm">جاري تهيئة المحادثة...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground px-4">
                <Bot size={40} className="text-primary/60" />
                <p className="text-sm font-medium">مرحباً! أنا مساعدك الضريبي.</p>
                <p className="text-xs">اسألني عن الضرائب الجزائرية، G50، TVA، IBS، IRG، المواعيد الضريبية وغيرها.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-background border border-border text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {sendMessage.isPending && (
              <div className="flex justify-end">
                <div className="bg-background border border-border rounded-2xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 text-sm"
                disabled={!conversationId || sendMessage.isPending || isCreating}
              />
              <Button
                size="icon"
                className="shrink-0"
                onClick={handleSend}
                disabled={!input.trim() || !conversationId || sendMessage.isPending || isCreating}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 relative"
        onClick={open ? () => setOpen(false) : handleOpen}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
        )}
      </Button>
    </div>
  );
}
