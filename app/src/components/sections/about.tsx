import { Users, Trophy, Heart, Shield } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

const valueCards = [
  { icon: Users, title: "Community", contentKey: "about_value_community" },
  { icon: Trophy, title: "Development", contentKey: "about_value_development" },
  { icon: Heart, title: "Enjoyment", contentKey: "about_value_enjoyment" },
  { icon: Shield, title: "Respect", contentKey: "about_value_respect" },
];

export function About() {
  const { data: content = {} } = useSiteContent();
  const g = (key: string, fallback: string) => content[key] || fallback;

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
                About Us
              </p>
              <h2 className="text-4xl md:text-5xl text-foreground uppercase mb-6">
                {g('about_heading', 'More Than A Club')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {g('about_body_1', 'Bradwell FC is a grassroots youth football club dedicated to providing a safe, inclusive, and enjoyable environment for young players to develop their football skills and grow as individuals.')}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {g('about_body_2', 'Run by FA-qualified volunteer coaches, we welcome players of all abilities and are proud to be part of the local football community.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {valueCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors"
                >
                  <card.icon className="text-primary mb-3" size={28} />
                  <h3 className="font-heading text-sm uppercase tracking-wider text-foreground mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {g(card.contentKey, '')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
