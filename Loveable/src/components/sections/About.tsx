import { Users, Trophy, Heart, Shield } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "Community",
    description: "Building friendships and teamwork both on and off the pitch.",
  },
  {
    icon: Trophy,
    title: "Development",
    description: "Helping every player improve their skills and confidence.",
  },
  {
    icon: Heart,
    title: "Enjoyment",
    description: "Making sure every child has fun and loves the game.",
  },
  {
    icon: Shield,
    title: "Respect",
    description: "Fair play, sportsmanship, and respect for all.",
  },
];

const About = () => {
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
                More Than
                <br />
                <span className="text-primary">A Club</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Bradwell FC is a grassroots youth football club dedicated to
                providing a safe, inclusive, and enjoyable environment for young
                players to develop their football skills and grow as individuals.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Run by FA-qualified volunteer coaches, we welcome players of all
                abilities and are proud to be part of the local football
                community.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors"
                >
                  <value.icon className="text-primary mb-3" size={28} />
                  <h3 className="font-heading text-sm uppercase tracking-wider text-foreground mb-1">
                    {value.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
