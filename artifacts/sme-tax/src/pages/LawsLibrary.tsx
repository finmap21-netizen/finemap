import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LawsLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["lawsSearch", query],
    queryFn: async () => {
      if (!query) return null;
      const res = await fetch(`/api/laws/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("فشل في جلب النتائج");
      return res.json();
    },
    enabled: !!query,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setQuery(searchTerm.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">مكتبة القوانين الجبائية</h1>
          <p className="text-muted-foreground mt-1">ابحث في قانون الضرائب المباشرة والرسوم المماثلة (إصدار 2026)</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="اكتب مصطلحاً للبحث (مثال: الغرامات، الضريبة على الدخل، IBS...)"
              className="flex-1 text-lg py-6"
            />
            <Button type="submit" disabled={isLoading} className="px-8 py-6 h-auto text-lg">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Search className="w-5 h-5 ml-2" />}
              بحث
            </Button>
          </form>
        </CardContent>
      </Card>

      {query && !isLoading && data?.results?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">لم يتم العثور على نتائج مطابقة لـ "{query}"</p>
          <p className="text-sm text-muted-foreground mt-2">حاول استخدام كلمات مفتاحية مختلفة أو أقل</p>
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-destructive">
          <p>حدث خطأ أثناء البحث: {(error as Error).message}</p>
        </div>
      )}

      {data?.results && data.results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            نتائج البحث: وجدنا تطابق في {data.total_pages_matched} صفحة
          </h2>
          
          {data.results.map((pageData: any) => (
            <Card key={pageData.page_id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <CardTitle className="flex justify-between items-center text-lg">
                  <span>الصفحة رقم {pageData.page_id}</span>
                  <Badge variant="secondary">{pageData.matches.length} نتيجة مطابقة</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {pageData.matches.map((match: any, idx: number) => {
                  // Basic highlighting of the search terms
                  const terms = query.split(" ").filter(t => t.length > 1);
                  let highlightedText = match.text;
                  terms.forEach(term => {
                    const regex = new RegExp(`(${term})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-1">$1</mark>');
                  });

                  return (
                    <div key={idx} className="p-4 bg-muted/20 rounded-md border text-sm leading-relaxed" dir="rtl">
                      <p dangerouslySetInnerHTML={{ __html: highlightedText }} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
