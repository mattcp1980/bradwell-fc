import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { usePublishedNews } from "@/hooks/use-news";
import { NewsShareButtons } from "@/components/shared/news-share-buttons";

export function NewsPreview() {
  const { data: posts = [] } = usePublishedNews();
  const latest = posts.slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section id="news" className="py-20 bg-muted/50">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
            Latest
          </p>
          <h2 className="text-4xl md:text-5xl text-foreground uppercase">
            Club News
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {latest.map((post, index) => (
            <article
              key={post.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="h-2 bg-primary" />
              )}
              <div className="p-6">
                <p className="text-xs text-muted-foreground mb-3">
                  {format(new Date(post.created_at), 'd MMM yyyy')}
                </p>
                <h3 className="font-heading text-lg uppercase text-foreground mb-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <Link
                  to={`/news/${post.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-royal-light transition-colors group-hover:gap-2"
                >
                  Read more <ArrowRight size={14} />
                </Link>
                <div className="pt-3 mt-3 border-t border-border/50">
                  <NewsShareButtons articleId={post.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
