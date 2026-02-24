import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import clubBadge from "@/assets/club-badge.jpg";
import { useSiteContent } from "@/hooks/use-site-content";

const quickLinks = [
  { label: "Fixtures", href: "/fixtures" },
  { label: "News", href: "/news" },
  { label: "Parents", href: "/parents" },
  { label: "Coach Portal", href: "/portal" },
];

export function Footer() {
  const { data: content = {} } = useSiteContent();
  const g = (key: string, fallback: string) => content[key] || fallback;

  return (
    <footer id="contact" className="bg-secondary text-secondary-foreground">
      <div className="container px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={clubBadge} alt="Bradwell FC badge" className="w-10 h-10 rounded-full" />
              <span className="font-heading text-xl uppercase tracking-wider">
                Bradwell FC
              </span>
            </div>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed">
              {g('footer_tagline', 'A grassroots youth football club building players and community since 2000.')}
            </p>
          </div>

          <div>
            <h4 className="font-heading uppercase tracking-wider text-sm mb-4 text-primary">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-secondary-foreground/60 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-heading uppercase tracking-wider text-sm mb-4 text-primary">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${g('contact_email', 'info@bradwellfc.co.uk')}`}
                className="flex items-center gap-2 text-sm text-secondary-foreground/60 hover:text-primary transition-colors"
              >
                <Mail size={14} />
                {g('contact_email', 'info@bradwellfc.co.uk')}
              </a>
              <div className="flex items-center gap-2 text-sm text-secondary-foreground/60">
                <MapPin size={14} />
                {g('contact_address', 'Bradwell Park, Bradwell')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-light/50">
        <div className="container px-4 py-4">
          <p className="text-xs text-secondary-foreground/40 text-center">
            © {new Date().getFullYear()} Bradwell FC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
