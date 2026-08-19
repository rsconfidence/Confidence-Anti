import { useListCaseStudies } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export default function CaseStudies() {
  const { data: caseStudies, isLoading } = useListCaseStudies();

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif">Case Studies</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Deep dives into complex problems, architectural decisions, and the process behind the final product.
        </p>
      </div>

      <div className="space-y-12">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))
        ) : (
          caseStudies?.map((study, idx) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group border-t border-border pt-8 first:border-t-0 first:pt-0"
            >
              <div className="grid md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                  <div className="text-sm font-mono text-muted-foreground sticky top-24">
                    {study.projectTitle || 'Case Study'}
                  </div>
                </div>
                <div className="md:col-span-3 space-y-4">
                  <h2 className="text-2xl font-serif group-hover:text-primary transition-colors">
                    <Link href={`/case-studies/${study.slug}`}>{study.title}</Link>
                  </h2>
                  <p className="text-muted-foreground leading-relaxed line-clamp-3">
                    {study.challenge}
                  </p>
                  <Link href={`/case-studies/${study.slug}`} className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-primary/80 transition-colors pt-4">
                    Read study <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
