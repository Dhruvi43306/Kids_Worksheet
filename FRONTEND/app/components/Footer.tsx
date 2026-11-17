import Link from "next/link";
import { BookOpen } from "lucide-react";
import "@/app/components/components.css";

const subjectLinks = [
  { label: "Math",              href: "/math" },
  { label: "English",           href: "/english" },
  { label: "Reading",           href: "/reading" },
  { label: "Writing",           href: "/writing" },
  { label: "Science",           href: "/science" },
  { label: "Puzzles & Logic",   href: "/puzzles" },
  { label: "General Knowledge", href: "/general-knowledge" },
  { label: "Arts & Creativity", href: "/arts" },
];

const infoLinks = [
  { label: "For Teachers", href: "/teachers" },
  { label: "For Parents",  href: "/parents" },
  { label: "About",        href: "/about" },
  { label: "Contact",      href: "/contact" },
  { label: "Help",         href: "/help" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use",   href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        {/* Brand column */}
        <div className="footer__brand">
          <Link href="/" className="footer__logo">
            <div className="footer__logo-icon">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <span className="footer__logo-text">
              Learn<span className="footer__logo-spark">Spark</span>
            </span>
          </Link>
          <p className="footer__tagline">
            🌈 Learn · Play · Grow
          </p>
          <p className="footer__desc">
            Premium educational worksheets for curious young minds across the globe.
            Printable, colourful, and curriculum-aligned.
          </p>
          <div className="footer__badges">
            <span className="footer__badge">🌍 International</span>
            <span className="footer__badge">📚 K–5</span>
            <span className="footer__badge">🎨 Free Printables</span>
          </div>
        </div>

        {/* Subjects */}
        <div className="footer__col">
          <h3 className="footer__col-title">Subjects</h3>
          <ul className="footer__col-list">
            {subjectLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="footer__col-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div className="footer__col">
          <h3 className="footer__col-title">Information</h3>
          <ul className="footer__col-list">
            {infoLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="footer__col-link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Grade levels */}
        <div className="footer__col">
          <h3 className="footer__col-title">Grade Levels</h3>
          <ul className="footer__col-list">
            {["Preschool", "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"].map((g) => (
              <li key={g}>
                <Link href={`/grades/${g.toLowerCase().replace(" ", "-")}`} className="footer__col-link">
                  {g}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="footer__bottom-inner container">
          <p className="footer__copyright">© 2026 LearnSpark. Crafted with ❤️ for young learners worldwide.</p>
          <div className="footer__legal">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="footer__legal-link">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
