import { useGetCaseStudy, getGetCaseStudyQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function CaseStudyDetail() {
  const [, params] = useRoute("/case-studies/:slug");
  const slug = params?.slug || "";

  const { data: study, isLoading } = useGetCaseStudy(slug, {
    query: { enabled: !!slug, queryKey: getGetCaseStudyQueryKey(slug) }
  });

  if (isLoading) return <div className="animate-pulse space-y-8 max-w-3xl mx-auto"><Skeleton className="h-12 w-3/4"/><Skeleton className="h-32 w-full"/></div>;
  if (!study) return <div>Case study not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-16"
    >
      <div className="space-y-6">
        <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> All case studies
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
          {study.title}
        </h1>
        {study.projectTitle && (
          <div className="text-lg text-muted-foreground">
            Project: <Link href={`/projects/${study.projectSlug}`} className="text-primary hover:underline">{study.projectTitle}</Link>
          </div>
        )}
      </div>

      <div className="prose dark:prose-invert prose-p:leading-relaxed prose-headings:font-serif max-w-none space-y-12">
        {study.challenge && (
          <section>
            <h2>The Challenge</h2>
            <p>{study.challenge}</p>
          </section>
        )}

        {study.processImage && (
          <figure className="my-12">
            <img src={study.processImage} alt="Process diagram" className="w-full rounded-none bg-muted" />
          </figure>
        )}

        {study.solution && (
          <section>
            <h2>The Solution</h2>
            <p>{study.solution}</p>
          </section>
        )}

        {study.architectureDiagram && (
          <figure className="my-12 border border-border p-4 bg-muted/20">
            <img src={study.architectureDiagram} alt="Architecture diagram" className="w-full" />
          </figure>
        )}

        {study.technicalDetails && (
          <section>
            <h2>Technical Details</h2>
            <p>{study.technicalDetails}</p>
          </section>
        )}

        {study.resultsImage && (
          <figure className="my-12">
            <img src={study.resultsImage} alt="Results" className="w-full rounded-none bg-muted" />
          </figure>
        )}

        {study.results && (
          <section>
            <h2>Results & Impact</h2>
            <p>{study.results}</p>
          </section>
        )}

        {study.learnings && (
          <section className="bg-muted/30 p-8 border-l-2 border-primary">
            <h2 className="mt-0">Key Learnings</h2>
            <p className="mb-0">{study.learnings}</p>
          </section>
        )}
      </div>
    </motion.div>
  );
}
