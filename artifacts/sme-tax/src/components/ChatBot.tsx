import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "مرحباً! أنا المساعد الذكي الخاص بك من FinMap. كيف يمكنني مساعدتك في الشؤون الضريبية اليوم؟" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...newMessages, { role: "model", content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: "model", content: "عذراً، حدث خطأ أثناء الاتصال بالخادم." }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "model", content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90 transition-transform hover:scale-105"
        >
          <MessageCircle size={28} className="text-primary-foreground" />
        </Button>
      )}

      {isOpen && (
        <div className="bg-card w-80 sm:w-96 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <span className="font-bold text-lg">مساعد FinMap الذكي</span>
            </div>
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] bg-muted/20 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-muted border border-border rounded-tl-none text-foreground'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-muted border border-border rounded-2xl rounded-tl-none p-3 max-w-[85%] flex gap-1">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border flex gap-2 items-center">
            <Input 
              placeholder="اسألني عن الضرائب..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border-primary/20 focus-visible:ring-primary/50"
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSend} disabled={!input.trim() || isLoading} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rotate-180" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
