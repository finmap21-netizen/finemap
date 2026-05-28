import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, X, Send, Loader2, Bot, Paperclip, FileText, Image as ImageIcon, Mic, Volume2, MicOff, VolumeX } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

// Types for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function ChatBot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'model')) {
      setMessages([
        { role: 'model', parts: [{ text: t('chatbot_welcome') }] }
      ]);
    }
  }, [t, i18n.language]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string, type: string, data: string } | null>(null);
  
  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-DZ'; // Arabic Algeria

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            setInput(prev => prev + ' ' + event.results[i][0].transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({ title: t('unsupported'), description: t('unsupported_browser'), variant: "destructive" });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setInput(""); // Clear input when starting to record
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA'; // Fallback to Saudi Arabic voice which is usually better supported
    utterance.rate = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('file_too_large'), description: t('file_too_large_desc'), variant: "destructive" });
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({ title: t('unsupported_file_type'), description: t('unsupported_file_type_desc'), variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result?.toString().split(',')[1];
      if (base64) {
        setAttachedFile({ name: file.name, type: file.type, data: base64 });
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const parts: any[] = [];
    if (input.trim()) parts.push({ text: input.trim() });
    
    if (attachedFile) {
      parts.push({ inlineData: { mimeType: attachedFile.type, data: attachedFile.data } });
      if (parts.length === 1) parts.unshift({ text: "قم بتحليل هذا الملف." });
    }

    const userMessage = input.trim();
    setInput("");
    const fileRef = attachedFile;
    setAttachedFile(null);

    const newUserMsg = { role: "user", parts, displayContext: fileRef?.name };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(msg => ({ role: msg.role, parts: msg.parts }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      let data;
      const textResponse = await response.text();
      try {
        data = JSON.parse(textResponse);
      } catch (e) {
        setMessages([...newMessages, { role: "model", parts: [{ text: t('server_error_response') }] }]);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        const replyText = data.reply;
        setMessages([...newMessages, { role: "model", parts: [{ text: replyText }] }]);
        if (autoSpeak) speakText(replyText);
      } else {
        setMessages([...newMessages, { role: "model", parts: [{ text: data.reply || data.error || "عذراً، حدث خطأ أثناء الاتصال بالخادم." }] }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "model", parts: [{ text: t('connection_error') }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-primary hover:bg-primary/90 transition-transform hover:scale-105">
          <MessageCircle size={28} className="text-primary-foreground" />
        </Button>
      )}

      {isOpen && (
        <div className="bg-card w-[350px] sm:w-[450px] rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary p-3 flex justify-between items-center text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <span className="font-bold">{t('bot_title')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className={`text-primary-foreground ${autoSpeak ? 'bg-primary-foreground/20' : 'hover:bg-primary/80'}`} onClick={toggleAutoSpeak} title={autoSpeak ? "إيقاف الرد الصوتي" : "تفعيل الرد الصوتي"}>
                {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[350px] max-h-[450px] bg-muted/20 space-y-4">
            {messages.map((msg, idx) => {
              const textContent = msg.parts?.find((p: any) => p.text)?.text;
              return (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted border border-border rounded-tl-none text-foreground'}`}>
                    {msg.displayContext && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded-lg text-xs">
                        {msg.displayContext.endsWith('.pdf') ? <FileText size={14}/> : <ImageIcon size={14}/>}
                        <span className="truncate">{msg.displayContext}</span>
                      </div>
                    )}
                    {textContent}
                  </div>
                  {msg.role === 'model' && textContent && !autoSpeak && (
                    <button onClick={() => speakText(textContent)} className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors pr-2">
                      <Volume2 size={12} /> {t('chatbot_listen')}
                    </button>
                  )}
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
          <div className="p-2 bg-card border-t border-border flex gap-1 items-center">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp, application/pdf" onChange={handleFileChange} />
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isRecording}>
              <Paperclip size={18} />
            </Button>
            
            <div className="flex-1 relative">
              <Input 
                placeholder={isRecording ? t('chatbot_listening') : t('chatbot_placeholder')} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className={`w-full border-primary/20 focus-visible:ring-primary/50 pr-2 pl-10 ${isRecording ? 'border-red-500 ring-1 ring-red-500 bg-red-50/50' : ''}`}
                disabled={isLoading}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className={`absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 ${isRecording ? 'text-red-500 hover:text-red-600 animate-pulse bg-red-100' : 'text-muted-foreground hover:text-primary'}`}
                onClick={toggleRecording}
                disabled={isLoading}
                title={isRecording ? "إيقاف التسجيل" : "تحدث"}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
            </div>

            <Button size="icon" onClick={handleSend} disabled={(!input.trim() && !attachedFile) || isLoading} className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground ml-1">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rotate-180" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
