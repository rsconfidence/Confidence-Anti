import { Newsletter } from "@/components/newsletter";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

export function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setIsOpen(false); }, [location]);

  const navItems = [
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Writing" },
    { href: "/resume", label: "Resume" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-background border-b border-border shadow-md shadow-black/40"
          : "bg-background/60 backdrop-blur-md border-b border-white/5"
      )}
    >
      <div className="w-full max-w-5xl mx-auto flex h-16 items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-primary hover:text-primary/80 transition-colors z-50 shrink-0"
        >
          &lt; confidence.anti /&gt;
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.startsWith(item.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-medium text-primary-foreground bg-primary px-4 py-1.5 hover:bg-primary/80 transition-colors ml-2"
          >
            Contact
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden z-50 p-2 -mr-2 text-foreground hover:text-primary transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav — full overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 bg-background z-40 overflow-y-auto md:hidden">
          <nav className="flex flex-col gap-0 px-6 pt-4 pb-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "text-2xl font-serif py-4 border-b border-border/40 transition-colors",
                  location.startsWith(item.href) ? "text-primary" : "text-foreground hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="mt-8 inline-flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium px-6 py-4 hover:bg-primary/90 transition-colors"
            >
              Get In Touch
            </Link>
            <div className="mt-8 flex gap-4 text-sm font-mono text-muted-foreground">
              <a href="https://github.com/rsconfidence" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
              <a href="https://linkedin.com/in/confidenceanti" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/20 py-16 mt-20">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="font-mono text-xs text-primary tracking-widest uppercase mb-3">&lt; confidence.anti /&gt;</div>
            <h3 className="font-serif text-2xl mb-3">Let's build something.</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-sm leading-relaxed">
              Available for freelance projects and collaborations. Based in Aboadze, Takoradi, Ghana.
            </p>
            <Link href="/contact" className="text-sm font-mono font-medium text-primary hover:underline underline-offset-4">
              Get in touch →
            </Link>
          </div>
          <div className="md:justify-self-end">
            <Newsletter />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground pt-8 border-t border-border">
          <div className="font-mono text-xs">
            © {new Date().getFullYear()} Confidence Anti. Built with intent.
          </div>
          <div className="flex gap-6 font-mono text-xs uppercase tracking-wider">
            <a href="https://github.com/rsconfidence" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
            <a href="https://linkedin.com/in/confidenceanti" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            <Link href="/admin" className="opacity-0 hover:opacity-30 select-none pointer-events-auto transition-opacity duration-300 text-xs" aria-hidden="true" title="Admin">·</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/233553864655"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 39 39" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M19.5 0C8.73 0 0 8.73 0 19.5c0 3.44.9 6.67 2.47 9.46L0 39l10.34-2.43A19.42 19.42 0 0 0 19.5 39C30.27 39 39 30.27 39 19.5S30.27 0 19.5 0Z" fill="white"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M19.5 3.56c-8.79 0-15.94 7.15-15.94 15.94 0 3.49.11 5.47 1.8 8.55l-1.13 5.57 5.74-1.09c2.96 1.55 5.9 2.01 9.53 2.01 8.79 0 15.94-7.15 15.94-15.94S28.29 3.56 19.5 3.56Z" fill="#25D366"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M14.3 11.77c-.36-.81-.74-.83-1.09-.84-.28-.01-.6-.01-.93-.01-.32 0-.84.12-1.28.6-.44.48-1.68 1.64-1.68 4 0 2.36 1.72 4.64 1.96 4.96.24.32 3.33 5.31 8.2 7.24 4.06 1.6 4.88 1.28 5.76 1.2.88-.08 2.84-1.16 3.24-2.28.4-1.12.4-2.08.28-2.28-.12-.2-.44-.32-.92-.56-.48-.24-2.84-1.4-3.28-1.56-.44-.16-.76-.24-1.08.24-.32.48-1.24 1.56-1.52 1.88-.28.32-.56.36-1.04.12-.48-.24-2.04-.75-3.88-2.4-1.44-1.28-2.4-2.86-2.68-3.34-.28-.48-.03-.74.21-.98.22-.22.48-.56.72-.84.24-.28.32-.48.48-.8.16-.32.08-.6-.04-.84-.12-.24-1.05-2.6-1.43-3.51Z" fill="white"/>
      </svg>
    </a>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
