import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

// Placeholder items until the news page is wired to Supabase
const placeholderNews: NewsItem[] = [
  {
    id: 1,
    title: "Cup Run Continues with Dominant Win",
    excerpt: "Bradwell FC progressed to the quarter-finals with a commanding 4-0 victory at home.",
    date: "18 Feb 2026",
    category: "Match Report",
  },
  {
    id: 2,
    title: "New Training Sessions for Spring Term",
    excerpt: "Updated training schedule now available. Wednesday sessions move to 6pm from March.",
    date: "14 Feb 2026",
    category: "Club News",
  },
  {
    id: 3,
    title: "Volunteers Needed for Tournament Day",
    excerpt: "We're hosting the spring tournament on March 29th and need parent helpers for setup and refreshments.",
    date: "10 Feb 2026",
    category: "Events",
  },
];

export function NewsPreview() {
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
          {placeholderNews.map((item, index) => (
            <article
              key={item.id}
              className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-2 bg-primary" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-heading uppercase tracking-wider text-primary">
                    {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                <h3 className="font-heading text-lg uppercase text-foreground mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {item.excerpt}
                </p>
                <Link
                  to="/news"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-royal-light transition-colors group-hover:gap-2"
                >
                  Read more <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
