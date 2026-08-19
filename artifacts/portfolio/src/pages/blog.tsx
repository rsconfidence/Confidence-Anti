import { useListBlogPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

export default function Blog() {
  const { data: posts, isLoading } = useListBlogPosts();

  return (
    <div className="max-w-3xl mx-auto space-y-16">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif">Writing</h1>
        <p className="text-lg text-muted-foreground">
          Thoughts on software engineering, design patterns, and building durable systems.
        </p>
      </div>

      <div className="space-y-12">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : (
          posts?.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col gap-3"
            >
              <div className="flex items-center gap-4 text-sm font-mono text-muted-foreground">
                <time dateTime={post.publishedAt || ''}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Draft'}
                </time>
                {post.readingTimeMinutes && (
                  <>
                    <span>•</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </>
                )}
              </div>
              <h2 className="text-2xl font-serif group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              {post.excerpt && (
                <p className="text-muted-foreground leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Read post <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}
