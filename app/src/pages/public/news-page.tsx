import { format } from "date-fns";
import { usePublishedNews } from "@/hooks/use-news";

export function NewsPage() {
  const { data: posts = [], isLoading } = usePublishedNews();

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
            Latest
          </p>
          <h1 className="text-4xl md:text-5xl text-foreground uppercase">
            Club News
          </h1>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-card border border-border rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <p className="text-center text-muted-foreground">No news articles published yet.</p>
        )}

        {!isLoading && posts.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
                  <h2 className="font-heading text-lg uppercase text-foreground mb-2 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
