import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { getDailyTip, DailyTip } from "@/data/dailyTips";

interface NotificationState {
  hasSeenQuestion: boolean;
  hasSeenAnswer: boolean;
  lastTipDate: string;
}

export function DailyNotification() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const todayTip = getDailyTip();
    setTip(todayTip);

    const todayStr = new Date().toDateString();
    const storedState = localStorage.getItem("finmap_daily_tip");
    let state: NotificationState = { hasSeenQuestion: false, hasSeenAnswer: false, lastTipDate: "" };

    if (storedState) {
      state = JSON.parse(storedState);
      if (state.lastTipDate !== todayStr) {
        // Reset for new day
        state = { hasSeenQuestion: false, hasSeenAnswer: false, lastTipDate: todayStr };
        localStorage.setItem("finmap_daily_tip", JSON.stringify(state));
      }
    } else {
      state.lastTipDate = todayStr;
      localStorage.setItem("finmap_daily_tip", JSON.stringify(state));
    }

    if (!state.hasSeenQuestion) {
      setHasUnread(true);
    } else if (!state.hasSeenAnswer) {
      // For simplicity, if they saw question, answer is ready
      setShowAnswer(true);
      // Wait, if it wasn't seen, we should still show the unread dot
      setHasUnread(true); 
    } else {
      // Seen everything
      setShowAnswer(true);
      setHasUnread(false);
    }

    // Check periodically if answer should be revealed
    const checkInterval = setInterval(() => {
      const currentStored = localStorage.getItem("finmap_daily_tip");
      if (currentStored) {
        const curState: NotificationState = JSON.parse(currentStored);
        if (curState.hasSeenQuestion && !curState.hasSeenAnswer) {
           // wait 2 minutes (120000 ms) before making answer available
           const seenTime = parseInt(localStorage.getItem("finmap_tip_question_time") || "0");
           if (Date.now() - seenTime > 120000) {
              setShowAnswer(true);
              setHasUnread(true);
           }
        }
      }
    }, 5000);

    return () => clearInterval(checkInterval);

  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && tip) {
      const stateStr = localStorage.getItem("finmap_daily_tip");
      if (stateStr) {
        const state: NotificationState = JSON.parse(stateStr);
        if (!state.hasSeenQuestion) {
          // User just saw the question
          state.hasSeenQuestion = true;
          localStorage.setItem("finmap_daily_tip", JSON.stringify(state));
          localStorage.setItem("finmap_tip_question_time", String(Date.now()));
          setHasUnread(false);
          
          // Fast demo: answer available after 30 seconds
          setTimeout(() => {
            setShowAnswer(true);
            setHasUnread(true); // new unread notification for the answer
          }, 30000); 

        } else if (showAnswer && !state.hasSeenAnswer) {
          // User is seeing the answer now
          state.hasSeenAnswer = true;
          localStorage.setItem("finmap_daily_tip", JSON.stringify(state));
          setHasUnread(false);
        } else if (state.hasSeenQuestion && state.hasSeenAnswer) {
           // they already saw it all, clear any unread just in case
           setHasUnread(false);
        }
      }
    }
  };

  if (!tip) return null;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0 hover:bg-slate-200/50 rounded-full w-9 h-9">
          <Bell className="h-5 w-5 text-foreground" />
          {hasUnread && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-md">
              {tip.category}
            </span>
            <span className="text-xs text-muted-foreground font-medium">سؤال اليوم</span>
          </div>
          
          <div className="space-y-1">
            <h4 className="text-sm font-semibold leading-none text-foreground">{tip.question}</h4>
          </div>
          
          <div className={`p-3 rounded-md bg-muted transition-all duration-500 ${showAnswer ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-2 hidden'}`}>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary block mb-1">الجواب:</span>
              {tip.answer}
            </p>
          </div>
          
          {!showAnswer && (
            <p className="text-xs text-muted-foreground animate-pulse text-center pt-2">
              سيظهر الجواب بعد قليل...
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
