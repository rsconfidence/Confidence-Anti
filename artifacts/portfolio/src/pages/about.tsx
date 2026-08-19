import { useListSkills } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRight, MapPin, GraduationCap, Code2, Zap, Heart, Star, Send, CheckCircle } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const skills = [
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "REST APIs", "Drizzle ORM"] },
  { category: "Tools", items: ["Git", "VS Code", "Figma", "Postman", "Linux"] },
  { category: "Learning", items: ["React Native", "Docker", "AWS", "GraphQL"] },
];

const timeline = [
  { year: "2022", title: "Started at ATU", desc: "Began BSc Software Engineering at Accra Technical University, Ghana." },
  { year: "2023", title: "First Freelance Project", desc: "Built a web platform for a local client in Takoradi — shipped and live." },
  { year: "2024", title: "Growing Stack", desc: "Deepened expertise in full-stack development. Built real products, not just tutorials." },
  { year: "2025 →", title: "Now", desc: "Taking on bigger projects, collaborating with teams, building my brand." },
];

/* ─── Public testimonial form ─── */
function TestimonialForm() {
  const [form, setForm] = useState({ name: "", role: "", institution: "", text: "", rating: 5 });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.role || !form.text) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", role: "", institution: "", text: "", rating: 5 });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-serif">Thank you!</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your testimonial has been submitted and will appear on the site after a quick review.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-primary font-mono hover:underline underline-offset-4 mt-2"
        >
          Submit another →
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Your Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Dr. Kwame Asante"
            className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Your Role *</label>
          <input
            required
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="e.g. Lecturer / Client / Colleague"
            className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Institution / Company</label>
        <input
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
          placeholder="e.g. Accra Technical University"
          className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="space-y-1.5">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Your Testimonial *</label>
        <textarea
          required
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          placeholder="Share your honest experience working with Confidence..."
          rows={5}
          className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
        />
      </div>
      <div className="space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setForm({ ...form, rating: n })}
              className="transition-colors"
            >
              <Star className={`w-6 h-6 ${n <= form.rating ? "text-primary fill-primary" : "text-border"}`} />
            </button>
          ))}
        </div>
      </div>

      {status === "error" && (
        <p className="text-destructive text-sm font-mono">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        <Send className="w-4 h-4" />
        {status === "loading" ? "Submitting..." : "Submit Testimonial"}
      </button>
      <p className="text-xs text-muted-foreground">All submissions are reviewed before appearing on the site.</p>
    </form>
  );
}

export default function About() {
  const { data: skillGroups } = useListSkills();
  const displaySkills = skillGroups && skillGroups.length > 0 ? skillGroups : skills.map((g) => ({
    category: g.category,
    skills: g.items.map((name, i) => ({ id: i, name, category: g.category, proficiency: 5, sortOrder: i })),
  }));

  return (
    <div className="w-full">

      {/* ── HERO: Photo + Intro ── */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">

          {/* Photo column */}
          <Reveal className="md:col-span-2">
            <div className="relative">
              {/* Glow behind image */}
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
              <div className="relative overflow-hidden border border-primary/20" style={{ borderRadius: "4px" }}>
                <img
                  src="/confidence-anti.jpg"
                  alt="Confidence Anti"
                  className="w-full aspect-[3/4] object-cover object-top"
                />
                {/* Overlay badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/80 to-transparent p-5">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground text-xs">Aboadze, Takoradi, Ghana 🇬🇭</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground text-xs">Accra Technical University</span>
                  </div>
                  {/* Availability pill */}
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono text-primary">Open to work</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Text column */}
          <Reveal delay={0.15} className="md:col-span-3 space-y-6 pt-2">
            <div>
              <div className="font-mono text-xs text-primary tracking-widest uppercase mb-3">// about me</div>
              <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-4">
                Hi, I'm <span className="text-primary">Confidence Anti.</span>
              </h1>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              I'm a <strong className="text-foreground">software engineering student</strong> at{" "}
              <a href="https://atu.edu.gh" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline underline-offset-4">
                Accra Technical University
              </a>{" "}
              in Ghana, passionate about building real products that solve real problems — not just academic exercises.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Based in <strong className="text-foreground">Aboadze, Takoradi</strong>, I work at the intersection of clean code and thoughtful design. I believe great software should be fast, accessible, and built with care for the people who use it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              When I'm not coding, I'm exploring new technologies, contributing to open-source projects, and working on ideas that can make a difference in my community and beyond.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/resume" className="inline-flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-5 py-2.5 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                View Resume <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-medium border border-border px-5 py-2.5 hover:border-primary hover:text-primary transition-all">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="w-full bg-card/30 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="mb-10">
            <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// what drives me</div>
            <h2 className="text-2xl md:text-3xl font-serif">My Values</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px bg-border">
            {[
              { icon: <Zap className="w-5 h-5" />, title: "Real Impact", desc: "I build products that solve actual problems — not demo apps that collect dust in a portfolio." },
              { icon: <Code2 className="w-5 h-5" />, title: "Clean Code", desc: "Readable, maintainable, structured. The next developer who reads my code should smile." },
              { icon: <Heart className="w-5 h-5" />, title: "User First", desc: "Great software respects the user's time. I design and build with the end user always in mind." },
            ].map((v, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-background p-6 md:p-8 space-y-3 h-full">
                  <div className="text-primary">{v.icon}</div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-foreground">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16">
        <Reveal className="mb-10">
          <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// technical skills</div>
          <h2 className="text-2xl md:text-3xl font-serif">Tools & Technologies</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {displaySkills.map((group, i) => (
            <Reveal key={group.category} delay={i * 0.08}>
              <div className="space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-widest text-primary border-b border-primary/20 pb-2">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span key={skill.id} className="text-xs font-mono bg-muted/60 border border-border/50 px-2.5 py-1 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="w-full bg-card/20 border-y border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="mb-10">
            <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// my journey</div>
            <h2 className="text-2xl md:text-3xl font-serif">How I got here</h2>
          </Reveal>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="grid md:grid-cols-[7rem_1fr] gap-4 md:gap-8 items-start">
                    <div className="flex items-center gap-3 md:justify-end">
                      <span className="font-mono text-xs text-primary whitespace-nowrap">{item.year}</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shrink-0 hidden md:block" />
                    </div>
                    <div className="bg-background border border-border/50 p-4 hover:border-primary/30 transition-colors">
                      <h3 className="font-medium text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIFY FORM ── */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left: info */}
          <Reveal>
            <div className="space-y-5">
              <div className="font-mono text-xs text-primary tracking-widest uppercase">// testify</div>
              <h2 className="text-3xl md:text-4xl font-serif leading-tight">
                Worked with me?<br />
                <span className="text-primary italic">Say something.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're a lecturer, a client, a colleague, or anyone who has seen my work — I'd love to hear your honest experience.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your testimonial helps others know who I am as a developer and collaborator. It only takes 2 minutes.
              </p>
              <div className="flex items-center gap-3 p-4 border border-primary/20 bg-primary/5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  All testimonials are reviewed before going live. No spam — just real words from real people.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal delay={0.15}>
            <div className="border border-border bg-card p-6 md:p-8">
              <TestimonialForm />
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
