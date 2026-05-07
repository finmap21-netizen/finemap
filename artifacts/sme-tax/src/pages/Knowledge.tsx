import { useState } from "react";
import { useListKnowledgeItems } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, Lightbulb } from "lucide-react";

export default function Knowledge() {
  const [q, setQ] = useState("");
  const [regime, setRegime] = useState<string>("all");
  
  const { data: items, isLoading } = useListKnowledgeItems({
    q: q || undefined,
    regime: regime !== "all" ? regime : undefined
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">قاعدة المعرفة الضريبية</h1>
      
      <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن سؤال أو مصطلح..." 
            className="pr-10" 
            value={q} 
            onChange={e => setQ(e.target.value)} 
          />
        </div>
        <Select value={regime} onValueChange={setRegime}>
          <SelectTrigger className="w-full md:w-64">
            <SelectValue placeholder="تصفية حسب النظام" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنظمة</SelectItem>
            <SelectItem value="real">النظام الحقيقي</SelectItem>
            <SelectItem value="simplified_real">النظام الحقيقي المبسط</SelectItem>
            <SelectItem value="forfaitaire">النظام الجزافي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div>جاري التحميل...</div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Accordion type="single" collapsible className="w-full">
            {items?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">لا توجد نتائج مطابقة لبحثك</div>
            ) : (
              items?.map((item, index) => (
                <AccordionItem key={item.id} value={`item-${item.id}`} className={index === items.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="px-4 hover:bg-muted/30 text-right">
                    <div className="flex flex-col items-start gap-2">
                      <span className="font-semibold text-lg">{item.questionAr}</span>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        {item.regime && <Badge variant="outline">{item.regime}</Badge>}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="pt-2 text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {item.answerAr}
                    </div>
                    {item.tipAr && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-3 text-amber-900">
                        <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
                        <div className="text-sm">
                          <span className="font-bold">نصيحة: </span>
                          {item.tipAr}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
}
