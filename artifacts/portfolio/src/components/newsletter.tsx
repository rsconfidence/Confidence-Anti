import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubscribe } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export function Newsletter() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" }
  });

  const subscribe = useSubscribe();

  function onSubmit(data: z.infer<typeof schema>) {
    subscribe.mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Subscribed successfully!");
          form.reset();
        },
        onError: () => {
          toast.error("Failed to subscribe. Please try again.");
        }
      }
    );
  }

  return (
    <div className="bg-muted/30 p-8 border border-border">
      <div className="max-w-xl space-y-4">
        <h3 className="text-2xl font-serif">Stay updated</h3>
        <p className="text-muted-foreground text-sm">
          Occasional thoughts on design engineering, architecture, and craft. No spam, ever.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="your@email.com" 
                        className="pl-9 rounded-none bg-background" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={subscribe.isPending}
              className="rounded-none whitespace-nowrap shrink-0"
            >
              {subscribe.isPending ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
