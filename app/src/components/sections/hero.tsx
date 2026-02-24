import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import clubBadge from "@/assets/club-badge.jpg";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroBg}
        alt="Football pitch at sunset"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-gradient" />

      <div className="relative z-10 container text-center px-4">
        <div className="animate-fade-in-up">
          <img
            src={clubBadge}
            alt="Bradwell FC badge"
            className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-6 rounded-full shadow-2xl border-4 border-primary/50"
          />
          <p className="font-heading text-primary uppercase tracking-[0.3em] text-sm md:text-base mb-4">
            Est. 2000
          </p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl uppercase text-primary-foreground leading-[0.95] mb-6">
            Bradwell
            <br />
            <span className="text-gradient-royal">Football Club</span>
          </h1>
          <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto mb-10 font-light">
            Community football at its finest. Building young players, creating lasting memories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base" onClick={() => navigate("/portal")}>
              Coach Portal
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-base border border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => navigate("/parents")}
            >
              Parents Hub
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
