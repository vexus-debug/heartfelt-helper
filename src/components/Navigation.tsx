import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
];

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 brand-curve ${
        scrolled
          ? "bg-card/95 backdrop-blur-xl shadow-ceramic-md"
          : "bg-card/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Zoe Care" className="h-9 w-9 object-contain" />
          <div className="leading-tight">
            <span className="font-display font-700 text-sm tracking-[0.15em] text-foreground">
              ZOE CARE
            </span>
            <p className="text-[10px] font-display font-600 text-muted-foreground tracking-wide">
              DENTAL CLINIC
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleClick(item.href)}
              className="px-5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 press-scale"
            >
              {item.label}
            </button>
          ))}
          <a
            href="https://wa.me/2347038899828?text=Hello%20Zoe%20Care,%20I%20would%20like%20to%20book%20an%20appointment."
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-300 press-scale"
          >
            Book Now
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors press-scale"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleClick(item.href)}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </button>
            ))}
            <a
              href="https://wa.me/2347038899828?text=Hello%20Zoe%20Care,%20I%20would%20like%20to%20book%20an%20appointment."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-medium text-center hover:opacity-90 transition-all"
            >
              Book Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navigation;
