import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import clubBadge from "@/assets/club-badge.jpg";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "News", href: "/news" },
  { label: "Parents", href: "/parents" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-dark-light/50">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={clubBadge} alt="Bradwell FC badge" className="w-9 h-9 rounded-full" />
          <span className="font-heading text-lg uppercase tracking-wider text-secondary-foreground">
            Bradwell FC
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="px-4 py-2 text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors uppercase tracking-wide font-heading"
            >
              {item.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="ml-4 border border-white/30 text-white hover:bg-white/10 hover:text-white"
            onClick={() => navigate("/portal")}
          >
            Manager Login
          </Button>
          <Button
            size="sm"
            className="ml-2"
            onClick={() => navigate("/admin")}
          >
            Admin Login
          </Button>
        </nav>

        <button
          className="md:hidden text-secondary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-secondary border-t border-dark-light/50">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="px-4 py-2 text-sm font-heading uppercase tracking-wide text-secondary-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-fit border border-white/30 text-white hover:bg-white/10 hover:text-white"
              onClick={() => { setMobileOpen(false); navigate("/portal"); }}
            >
              Manager Login
            </Button>
            <Button
              size="sm"
              className="mt-2 w-fit"
              onClick={() => { setMobileOpen(false); navigate("/admin"); }}
            >
              Admin Login
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
