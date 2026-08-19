import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";
import { Github, Linkedin, MapPin, Mail } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const submitContact = useSubmitContact();

  function onSubmit(data: FormValues) {
    submitContact.mutate(
      { data },
      {
        onSuccess: () => {
          toast.success("Message sent! I'll get back to you soon.");
          form.reset();
        },
        onError: () => {
          toast.error("Failed to send. Please try again.");
        },
      }
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid md:grid-cols-2 gap-16">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif">Get In Touch</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have a project idea? Want to collaborate? Or just want to say hi?
              I'm always open to interesting conversations.
            </p>
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="text-sm font-mono text-muted-foreground mb-1">Location</h3>
                <p>Aboadze, Takoradi, Ghana</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-1 shrink-0" />
              <div>
                <h3 className="text-sm font-mono text-muted-foreground mb-1">Email</h3>
                <a href="mailto:confidenceanti@gmail.com" className="hover:text-primary transition-colors">
                  confidenceanti@gmail.com
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-mono text-muted-foreground mb-3">Socials</h3>
              <div className="flex flex-col gap-3">
                <a
                  href="https://github.com/rsconfidence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub
                </a>
                <a
                  href="https://linkedin.com/in/confidenceanti"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border p-8"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs tracking-wider">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" className="focus-visible:ring-primary bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs tracking-wider">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" className="focus-visible:ring-primary bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-mono uppercase text-xs tracking-wider">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell me about your project or idea..."
                        className="min-h-[140px] focus-visible:ring-primary bg-background resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={submitContact.isPending}
                className="w-full uppercase tracking-wider font-mono text-xs py-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {submitContact.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
