import { useListSkills } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Download, GraduationCap } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { useEffect, useState } from "react";

export default function Resume() {
  const { data: skillGroups, isLoading } = useListSkills();
  const [resumePdf, setResumePdf] = useState("/resume.pdf");

  useEffect(() => {
    getSiteSettings().then((settings) => {
      if (settings.resumePdf) setResumePdf(settings.resumePdf);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-16">
      <div className="flex items-start justify-between gap-8 flex-col sm:flex-row">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif">Resume</h1>
          <p className="text-lg text-muted-foreground">
            Confidence Anti — Software Engineering Student & Developer
          </p>
        </div>
        <a
          href={resumePdf}
          download
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" /> Download PDF
        </a>
      </div>

      {/* Education */}
      <section className="space-y-8">
        <h2 className="text-2xl font-serif border-b border-border pb-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" /> Education
        </h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-4 gap-4 sm:gap-8"
        >
          <div className="sm:col-span-1 text-sm font-mono text-muted-foreground pt-1">
            2022 — Present
          </div>
          <div className="sm:col-span-3 space-y-2">
            <h3 className="text-xl font-medium">BSc Software Engineering</h3>
            <div className="text-primary font-mono text-sm">Accra Technical University, Ghana</div>
            <p className="text-muted-foreground leading-relaxed">
              Studying software engineering with a focus on building real-world applications.
              Active in technical projects and student developer communities.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Experience / Projects */}
      <section className="space-y-8">
        <h2 className="text-2xl font-serif border-b border-border pb-2">Projects & Experience</h2>
        <div className="space-y-12">
          {[
            {
              role: "Freelance Developer",
              company: "Self-employed",
              period: "2023 — Present",
              desc: "Building web applications and digital products for clients. Delivering full-stack solutions from design to deployment.",
            },
            {
              role: "Personal Projects",
              company: "Aboadze, Takoradi",
              period: "2021 — Present",
              desc: "Developing real products that solve everyday problems. Focused on clean code, modern tech stacks, and practical impact.",
            },
          ].map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="grid sm:grid-cols-4 gap-4 sm:gap-8"
            >
              <div className="sm:col-span-1 text-sm font-mono text-muted-foreground pt-1">
                {job.period}
              </div>
              <div className="sm:col-span-3 space-y-2">
                <h3 className="text-xl font-medium">{job.role}</h3>
                <div className="text-primary font-mono text-sm">{job.company}</div>
                <p className="text-muted-foreground leading-relaxed">{job.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-8">
        <h2 className="text-2xl font-serif border-b border-border pb-2">Technical Skills</h2>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : skillGroups && skillGroups.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-8">
            {skillGroups.map((group) => (
              <div key={group.category} className="space-y-4">
                <h3 className="font-mono text-sm uppercase tracking-wider text-primary">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span key={skill.id} className="px-3 py-1 bg-muted text-sm border border-border/50">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground font-mono text-sm">// add skills via admin dashboard</p>
        )}
      </section>
    </div>
  );
}
