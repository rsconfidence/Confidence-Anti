import { useGetProject, getGetProjectQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:slug");
  const slug = params?.slug || "";

  const { data: project, isLoading } = useGetProject(slug, {
    query: { enabled: !!slug, queryKey: getGetProjectQueryKey(slug) }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="space-y-6">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
          {project.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm font-mono text-muted-foreground">
          <span>{project.year}</span>
          <span>•</span>
          <span>{project.category}</span>
          {project.duration && (
            <>
              <span>•</span>
              <span>{project.duration}</span>
            </>
          )}
        </div>
      </div>

      {project.featuredImage && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img src={project.featuredImage} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <div className="prose dark:prose-invert prose-p:text-muted-foreground prose-headings:font-serif">
            <p className="text-lg leading-relaxed">{project.description}</p>
            {project.longDescription && (
              <div dangerouslySetInnerHTML={{ __html: project.longDescription }} />
            )}
          </div>
          
          {project.galleryImages && project.galleryImages.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-8">
              {project.galleryImages.map((img, i) => (
                <div key={i} className="aspect-square bg-muted">
                  <img src={img} alt={`${project.title} screenshot ${i+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map(tech => (
                <Badge key={tech} variant="secondary" className="font-mono text-xs rounded-none bg-muted hover:bg-muted">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Links</h3>
            <div className="flex flex-col gap-3">
              {project.liveLink && (
                <a href={project.liveLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" /> Live Site
                </a>
              )}
              {project.repositoryLink && (
                <a href={project.repositoryLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm hover:text-primary transition-colors">
                  <Github className="w-4 h-4" /> Source Code
                </a>
              )}
              {project.caseStudySlug && (
                <Link href={`/case-studies/${project.caseStudySlug}`} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                  Read Case Study <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
