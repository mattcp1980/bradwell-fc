import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import clubBadge from "@/assets/club-badge.jpg";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Parents", href: "/parents" },
  { label: "News", href: "#news" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-dark-light/50">
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-3" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <img src={clubBadge} alt="Bradwell FC badge" className="w-9 h-9 rounded-full" />
          <span className="font-heading text-lg uppercase tracking-wider text-secondary-foreground">
            Bradwell FC
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.href.startsWith("/")) {
                  e.preventDefault();
                  navigate(item.href);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-secondary-foreground/80 hover:text-primary transition-colors uppercase tracking-wide font-heading"
            >
              {item.label}
            </a>
          ))}
          <Button variant="heroOutline" size="sm" className="ml-4">
            Admin Login
          </Button>
          <Button variant="hero" size="sm" className="ml-2">
            Manager Login
          </Button>
        </nav>

        <button
          className="md:hidden text-secondary-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-secondary border-t border-dark-light/50">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-heading uppercase tracking-wide text-secondary-foreground/80 hover:text-primary transition-colors"
                onClick={(e) => {
                  setMobileOpen(false);
                  if (item.href.startsWith("/")) {
                    e.preventDefault();
                    navigate(item.href);
                  }
                }}
              >
                {item.label}
              </a>
            ))}
            <Button variant="heroOutline" size="sm" className="mt-2 w-fit">
              Admin Login
            </Button>
            <Button variant="hero" size="sm" className="mt-2 w-fit">
              Manager Login
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
