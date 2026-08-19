import { useListProjects, useGetProjectStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  const { data: projects, isLoading: loadingProjects } = useListProjects();
  const { data: stats } = useGetProjectStats();

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-serif">Projects</h1>
          <p className="text-lg text-muted-foreground">
            A selection of my work spanning web development, systems architecture, and interface design.
          </p>
        </div>
        
        {stats && (
          <div className="flex gap-6 text-sm font-mono text-muted-foreground">
            <div className="flex flex-col">
              <span className="text-2xl text-foreground font-sans font-medium">{stats.totalCount}</span>
              <span>Total Projects</span>
            </div>
            {stats.byCategory.slice(0, 2).map(cat => (
              <div key={cat.label} className="flex flex-col">
                <span className="text-2xl text-foreground font-sans font-medium">{cat.count}</span>
                <span>{cat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loadingProjects ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-[4/3]" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))
        ) : (
          projects?.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group flex flex-col gap-4"
            >
              <Link href={`/projects/${project.slug}`} className="block overflow-hidden relative aspect-[4/3] bg-muted border border-border">
                {project.featuredImage ? (
                  <img
                    src={project.featuredImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-sm">
                    {project.title}
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur rounded-none font-mono text-[10px] uppercase">
                    {project.year}
                  </Badge>
                </div>
              </Link>
              
              <div>
                <h3 className="text-xl font-serif mb-2">
                  <Link href={`/projects/${project.slug}`} className="hover:text-primary transition-colors">
                    {project.title}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(0, 3).map(tech => (
                    <span key={tech} className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1">
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="text-xs font-mono text-muted-foreground px-2 py-1">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
