import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGetMe } from "@workspace/api-client-react";

const formSchema = z.object({
  firstName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  lastName: z.string().min(2, "اللقب يجب أن يكون حرفين على الأقل"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
});

export default function ContactAdmin() {
  const { toast } = useToast();
  const { data: user } = useGetMe();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/support/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("فشل في إرسال الرسالة");
      }

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال رسالتك إلى الإدارة وسيتم الرد عليك قريباً.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-primary">تواصل مع الإدارة</h1>
      <Card>
        <CardHeader>
          <CardTitle>إرسال رسالة</CardTitle>
          <CardDescription>
            يمكنك إرسال استفسارك أو مشكلتك إلى الإدارة وسنقوم بمراجعتها في أقرب وقت.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم</FormLabel>
                      <FormControl>
                        <Input placeholder="الاسم" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اللقب</FormLabel>
                      <FormControl>
                        <Input placeholder="اللقب" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرسالة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب رسالتك هنا..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
