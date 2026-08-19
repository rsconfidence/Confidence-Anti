import { useGetFeaturedProjects, useGetRecentBlogPosts } from "@workspace/api-client-react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
} from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Github, Linkedin, Quote, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";
import { getSiteSettings } from "@/lib/site-settings";

/* ─── Typing animation ─── */
const typingPhrases = ["things.", "web apps.", "real products.", "solutions.", "the future."];

function TypingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = typingPhrases[phraseIndex];
    let t: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < current.length)
      t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 80);
    else if (!deleting && displayed.length === current.length)
      t = setTimeout(() => setDeleting(true), 1800);
    else if (deleting && displayed.length > 0)
      t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
    else { setDeleting(false); setPhraseIndex((i) => (i + 1) % typingPhrases.length); }
    return () => clearTimeout(t);
  }, [displayed, deleting, phraseIndex]);
  return (
    <span className="text-primary">
      {displayed}<span className="animate-pulse">|</span>
    </span>
  );
}

/* ─── Scroll-reveal wrapper ─── */
function Reveal({
  children,
  delay = 0,
  y = 40,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, rotateX: 8 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── 3D tilt card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)";
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Testimonials data ─── */
const testimonials = [
  {
    name: "Dr. Kwame Asante",
    role: "Lecturer, Software Engineering",
    institution: "Accra Technical University",
    avatar: "KA",
    rating: 5,
    text: "Confidence is one of the most driven students I've had the pleasure of teaching. His ability to translate classroom concepts into real, working products is exceptional. He doesn't just write code — he thinks deeply about the problem he's solving.",
  },
  {
    name: "Emmanuel Boateng",
    role: "Project Manager",
    institution: "Tech Startup, Takoradi",
    avatar: "EB",
    rating: 5,
    text: "We hired Confidence to build our company's web platform and he delivered beyond expectations. Professional, fast, and genuinely cared about the quality of his work. He brought ideas to the table we hadn't even considered.",
  },
  {
    name: "Abena Mensah",
    role: "Co-founder",
    institution: "Media Team Ghana",
    avatar: "AM",
    rating: 5,
    text: "Working with Confidence was a game-changer for our team. He built tools that streamlined our entire workflow. His passion for technology and his calm under pressure make him someone you want on every project.",
  },
  {
    name: "Mr. Isaac Forson",
    role: "HOD, Computer Science",
    institution: "Accra Technical University",
    avatar: "IF",
    rating: 5,
    text: "In all my years of teaching, I rarely see a student who is self-driven and proactive as Confidence. He consistently produces work that goes well beyond what's required. He will go very far in this industry.",
  },
  {
    name: "Nana Ofori",
    role: "Client",
    institution: "Aboadze, Takoradi",
    avatar: "NO",
    rating: 5,
    text: "I gave Confidence a brief for my business website and he came back with something far better than I imagined. He explained every decision clearly and made the whole experience stress-free. Highly recommended.",
  },
  {
    name: "Bright Darko",
    role: "Fellow Developer & Collaborator",
    institution: "Takoradi Tech Community",
    avatar: "BD",
    rating: 5,
    text: "Confidence has a rare mix of technical depth and creativity. He picks up new technologies quickly and always keeps the team motivated. Building alongside him is genuinely enjoyable — his energy is contagious.",
  },
];

/* ─── Main component ─── */
export default function Home() {
  const { data: featuredProjects, isLoading: loadingProjects } = useGetFeaturedProjects();
  const { data: recentPosts, isLoading: loadingPosts } = useGetRecentBlogPosts();

  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 1.08]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);
  const overlayOpacity = useTransform(heroScroll, [0, 0.5], [0.55, 0.85]);

  const springY = useSpring(heroY, { stiffness: 80, damping: 20 });

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroBackground, setHeroBackground] = useState("/confidence-anti.jpg");

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    getSiteSettings().then((settings) => {
      if (settings.heroBackground) setHeroBackground(settings.heroBackground);
    }).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">

      {/* ═══════════════════════════════════════════
          HERO — full-bleed 3D parallax
      ══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative -mt-20 h-screen min-h-[640px] flex items-center justify-center overflow-hidden"
      >
        {/* Parallax photo */}
        <motion.div
          style={{ y: springY, scale: heroScale }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={heroBackground}
            alt="Confidence Anti"
            className="w-full h-full object-cover object-top"
          />
        </motion.div>

        {/* Gradient overlay */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background pointer-events-none"
        />

        {/* Grid lines overlay for premium feel */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,214,120,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,214,120,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-mono text-sm text-primary tracking-widest uppercase mb-4"
          >
            Hi there, I am
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-8xl font-serif text-foreground leading-[1.05] mb-4"
            style={{ textShadow: "0 0 80px rgba(0,214,120,0.15)" }}
          >
            Confidence Anti.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-3xl md:text-4xl font-serif text-muted-foreground mb-6"
          >
            I build <TypingText />
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            className="text-base md:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Software engineering student at{" "}
            <span className="text-primary font-semibold">Accra Technical University</span>, Ghana.
            Building real products from Aboadze, Takoradi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium bg-primary text-primary-foreground px-8 py-3.5 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
            >
              View My Work <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium border border-border/60 bg-background/30 backdrop-blur-sm px-8 py-3.5 hover:border-primary hover:text-primary transition-all hover:scale-105 active:scale-95"
            >
              Get In Touch
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center justify-center gap-5 mt-8"
          >
            <a href="https://github.com/rsconfidence" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com/in/confidenceanti" target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors hover:scale-110 active:scale-95">
              <Linkedin className="w-5 h-5" />
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-primary to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════ */}
      <Reveal className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {[
            { value: "10+", label: "Projects Built" },
            { value: "5+", label: "Happy Clients" },
            { value: "2+", label: "Years Coding" },
            { value: "ATU", label: "University" },
          ].map((stat, i) => (
            <TiltCard key={i}>
              <div className="bg-card px-6 py-8 text-center">
                <div className="text-3xl md:text-4xl font-serif text-primary mb-1">{stat.value}</div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            </TiltCard>
          ))}
        </div>
      </Reveal>

      {/* ═══════════════════════════════════════════
          ABOUT SNAPSHOT
      ══════════════════════════════════════════ */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <Reveal delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-3 bg-primary/10 blur-2xl rounded-full" />
              <div
                className="relative overflow-hidden border border-border/50"
                style={{ borderRadius: "2px" }}
              >
                <img
                  src="/confidence-anti.jpg"
                  alt="Confidence Anti"
                  className="w-full aspect-[3/4] object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="font-mono text-xs text-primary tracking-widest uppercase mb-1">Based in</div>
                  <div className="text-sm text-foreground">Aboadze, Takoradi, Ghana 🇬🇭</div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="space-y-6">
              <div className="font-mono text-xs text-primary tracking-widest uppercase">// about me</div>
              <h2 className="text-3xl md:text-4xl font-serif leading-tight">
                Turning ideas into <span className="text-primary italic">real products</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                I'm a software engineering student at Accra Technical University, Ghana — but I don't wait to graduate before building. I create real, functional products that solve real problems.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From Aboadze, Takoradi, I work with clients and collaborate on projects that matter. I believe in clean code, honest communication, and work that speaks for itself.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {["React", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "Tailwind CSS"].map((skill) => (
                  <span key={skill} className="text-xs font-mono text-primary border border-primary/30 bg-primary/5 px-3 py-1">
                    {skill}
                  </span>
                ))}
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:underline underline-offset-4 pt-2">
                Read more about me <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURED PROJECTS
      ══════════════════════════════════════════ */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <Reveal className="flex items-end justify-between border-b border-border pb-4 mb-12">
          <div>
            <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// selected works</div>
            <h2 className="text-3xl font-serif">Projects</h2>
          </div>
          <Link href="/projects" className="hidden md:inline-flex text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
            [ view all ]
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {loadingProjects ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-[4/3]" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            ))
          ) : featuredProjects?.length === 0 ? (
            <Reveal className="col-span-2">
              <p className="text-muted-foreground font-mono text-sm py-8">// projects coming soon — check back!</p>
            </Reveal>
          ) : (
            featuredProjects?.map((project, idx) => (
              <Reveal key={project.id} delay={idx * 0.1}>
                <TiltCard>
                  <div className="group flex flex-col gap-5">
                    <Link href={`/projects/${project.slug}`} className="block overflow-hidden relative aspect-[4/3] bg-card border border-border">
                      {project.featuredImage ? (
                        <img src={project.featuredImage} alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/30">
                          <span className="font-mono text-xs text-muted-foreground">[ no image ]</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                    </Link>
                    <div className="space-y-2">
                      <Link href={`/projects/${project.slug}`}>
                        <h3 className="text-xl font-serif group-hover:text-primary transition-colors">{project.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      {project.techStack && (project.techStack as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(project.techStack as string[]).slice(0, 4).map((tag) => (
                            <span key={tag} className="text-xs font-mono text-primary border border-primary/30 px-2 py-0.5">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="w-full py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative w-full max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <div className="font-mono text-xs text-primary tracking-widest uppercase mb-3">// testimonials</div>
            <h2 className="text-3xl md:text-4xl font-serif">What people say</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Feedback from lecturers, clients, and collaborators I've had the privilege to work with.
            </p>
          </Reveal>

          {/* Featured testimonial */}
          <Reveal delay={0.1} className="mb-12">
            <div className="relative border border-primary/20 bg-card/50 backdrop-blur-sm p-8 md:p-12">
              <div className="absolute -top-3 left-8">
                <Quote className="w-6 h-6 text-primary fill-primary/20" />
              </div>
              <div className="absolute top-4 right-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />
                ))}
              </div>

              <motion.p
                key={activeTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-lg md:text-xl text-foreground/90 leading-relaxed font-serif italic mb-8"
              >
                "{testimonials[activeTestimonial].text}"
              </motion.p>

              <motion.div
                key={`author-${activeTestimonial}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-sm font-bold text-primary shrink-0">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonials[activeTestimonial].name}</div>
                  <div className="text-sm text-primary font-mono">{testimonials[activeTestimonial].role}</div>
                  <div className="text-xs text-muted-foreground">{testimonials[activeTestimonial].institution}</div>
                </div>
              </motion.div>

              {/* Dots */}
              <div className="flex gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeTestimonial ? "bg-primary w-6" : "bg-border w-3 hover:bg-primary/40"
                    }`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          {/* Grid of all testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <TiltCard>
                  <button
                    onClick={() => setActiveTestimonial(i)}
                    className={`w-full text-left p-5 border transition-all duration-200 cursor-pointer ${
                      i === activeTestimonial
                        ? "border-primary/50 bg-primary/5"
                        : "border-border bg-card/30 hover:border-primary/30 hover:bg-card/60"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground leading-tight">{t.name}</div>
                        <div className="text-xs text-primary font-mono">{t.role}</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">"{t.text}"</p>
                  </button>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          RECENT WRITING
      ══════════════════════════════════════════ */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20">
        <Reveal className="flex items-center justify-between border-b border-border pb-4 mb-10">
          <div>
            <div className="font-mono text-xs text-primary tracking-widest uppercase mb-2">// writing</div>
            <h2 className="text-3xl font-serif">Recent Posts</h2>
          </div>
          <Link href="/blog" className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
            [ read all ]
          </Link>
        </Reveal>
        <div className="flex flex-col">
          {loadingPosts ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 py-6 border-b border-border/50">
                <Skeleton className="h-6 w-1/3" /><Skeleton className="h-4 w-1/4" />
              </div>
            ))
          ) : recentPosts?.length === 0 ? (
            <Reveal><p className="text-muted-foreground font-mono text-sm py-6">// posts coming soon</p></Reveal>
          ) : (
            recentPosts?.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.07}>
                <Link href={`/blog/${post.slug}`}
                  className="group flex flex-col md:flex-row md:items-center gap-2 md:gap-8 py-6 border-b border-border/50 hover:bg-muted/20 transition-colors -mx-4 px-4">
                  <span className="text-sm font-mono text-muted-foreground shrink-0 w-32">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Draft"}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif group-hover:text-primary transition-colors mb-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all hidden md:block" />
                </Link>
              </Reveal>
            ))
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════ */}
      <Reveal className="w-full max-w-5xl mx-auto px-6 py-20">
        <TiltCard>
          <div className="relative border border-primary/20 bg-card overflow-hidden p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <div className="font-mono text-xs text-primary tracking-widest uppercase mb-4">// let's work together</div>
              <h2 className="text-3xl md:text-5xl font-serif mb-4">Have a project in mind?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                I'm available for freelance work and open to collaborations. Let's build something great.
              </p>
              <Link href="/contact"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-medium hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Start a conversation <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </TiltCard>
      </Reveal>

    </div>
  );
}
