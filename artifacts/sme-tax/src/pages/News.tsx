import { useListNews } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

export default function News() {
  const { data: news, isLoading } = useListNews();

  if (isLoading) return <div>جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">الأخبار والإعلانات الضريبية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news?.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
            لا توجد أخبار حالياً
          </div>
        ) : (
          news?.map(item => (
            <Card key={item.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge>{item.category}</Badge>
                </div>
                <CardTitle className="text-xl leading-snug">{item.titleAr}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {item.contentAr}
                </p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span dir="ltr">{new Date(item.publishedAt).toLocaleDateString('en-GB')}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
