import { useGetBlogPost, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import { useRoute } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Newsletter } from "@/components/newsletter";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";

  const { data: post, isLoading } = useGetBlogPost(slug, {
    query: { enabled: !!slug, queryKey: getGetBlogPostQueryKey(slug) }
  });

  if (isLoading) return <div className="max-w-2xl mx-auto space-y-8 animate-pulse"><Skeleton className="h-12 w-3/4"/><Skeleton className="h-4 w-1/4"/><Skeleton className="h-64 w-full"/></div>;
  if (!post) return <div>Post not found</div>;

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-12 pb-24"
    >
      <div className="space-y-6 text-center">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors absolute top-24 left-6 xl:left-auto xl:-ml-48">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        
        <div className="flex items-center justify-center gap-4 text-sm font-mono text-muted-foreground">
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
        
        <h1 className="text-4xl md:text-5xl font-serif leading-tight">
          {post.title}
        </h1>
      </div>

      {post.featuredImage && (
        <div className="aspect-[21/9] w-full bg-muted overflow-hidden">
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div 
        className="prose dark:prose-invert prose-p:leading-relaxed prose-headings:font-serif prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content || '' }}
      />

      <div className="border-t border-border pt-12 mt-16">
        <Newsletter />
      </div>
    </motion.article>
  );
}
