import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, Paperclip, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: 'model', parts: [{ text: "مرحباً! أنا المساعد الذكي الخاص بك من FinMap. يمكنك سؤالي عن الضرائب، أو إرفاق صور ومستندات PDF لفواتيرك وسأقوم بمعالجتها لك!" }] }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string, type: string, data: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "حجم الملف كبير", description: "يرجى اختيار ملف أقل من 5 ميغابايت", variant: "destructive" });
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: "نوع غير مدعوم", description: "يرجى إرفاق صورة (JPG/PNG) أو ملف PDF", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (base64) {
        setAttachedFile({
          name: file.name,
          type: file.type,
          data: base64
        });
      }
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    const parts: any[] = [];
    if (input.trim()) {
      parts.push({ text: input.trim() });
    }
    if (attachedFile) {
      parts.push({
        inlineData: {
          mimeType: attachedFile.type,
          data: attachedFile.data
        }
      });
      // Fallback text if no text provided
      if (parts.length === 1) {
        parts.unshift({ text: "قم بتحليل هذا الملف." });
      }
    }

    setInput("");
    const fileRef = attachedFile;
    setAttachedFile(null);

    const newUserMsg = { role: "user", parts, displayContext: fileRef?.name };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Send only parts that Gemini understands to the backend
      const apiMessages = newMessages.map(msg => ({
        role: msg.role,
        parts: msg.parts
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages([...newMessages, { role: "model", parts: [{ text: data.reply }] }]);
      } else {
        setMessages([...newMessages, { role: "model", parts: [{ text: data.reply || "عذراً، حدث خطأ أثناء الاتصال بالخادم." }] }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "model", parts: [{ text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." }] }]);
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
        <div className="bg-card w-[350px] sm:w-[450px] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">
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
          <div className="flex-1 p-4 overflow-y-auto min-h-[350px] max-h-[450px] bg-muted/20 space-y-4">
            {messages.map((msg, idx) => {
              const textContent = msg.parts?.find((p: any) => p.text)?.text;
              return (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted border border-border rounded-tl-none text-foreground'
                  }`}>
                    {msg.displayContext && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded-lg text-xs">
                        {msg.displayContext.endsWith('.pdf') ? <FileText size={14}/> : <ImageIcon size={14}/>}
                        <span className="truncate">{msg.displayContext}</span>
                      </div>
                    )}
                    {textContent}
                  </div>
                </div>
              );
            })}
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

          {/* Attachment Preview Area */}
          {attachedFile && (
            <div className="px-3 pt-2 pb-1 bg-card border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2 overflow-hidden">
                {attachedFile.type === 'application/pdf' ? <FileText size={14} className="text-primary"/> : <ImageIcon size={14} className="text-primary"/>}
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setAttachedFile(null)}>
                <X size={12} />
              </Button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border flex gap-2 items-center">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp, application/pdf"
              onChange={handleFileChange}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="shrink-0 text-muted-foreground hover:text-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Paperclip size={18} />
            </Button>
            <Input 
              placeholder="اسألني أو أرفق فاتورة..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 border-primary/20 focus-visible:ring-primary/50"
              disabled={isLoading}
            />
            <Button size="icon" onClick={handleSend} disabled={(!input.trim() && !attachedFile) || isLoading} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rotate-180" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
