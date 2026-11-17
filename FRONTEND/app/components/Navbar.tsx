"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BookOpen,
  Smile,
  Search,
  Calculator,
  Bookmark,
  PenTool,
  FlaskConical,
  Puzzle,
  Globe,
  Palette,
  FileText,
  Compass,
  ArrowRight,
} from "lucide-react";
import "@/app/components/components.css";

// Primary Links for top-level navigation
const PRIMARY_LINKS = [
  { label: "Math", href: "/math", icon: Calculator },
  { label: "English", href: "/english", icon: Bookmark },
  { label: "Science", href: "/science", badge: "New", icon: FlaskConical },
  { label: "Puzzles", href: "/puzzles", icon: Puzzle },
];

// Grouped sub-links for the "Explore" dropdown
const EXPLORE_GROUPS = [
  {
    category: "Subjects",
    items: [
      {
        label: "Reading",
        href: "/reading",
        desc: "Comprehension & phonics",
        icon: BookOpen,
      },
      {
        label: "Writing",
        href: "/writing",
        desc: "Grammar & essay skills",
        icon: PenTool,
      },
      {
        label: "General Knowledge",
        href: "/general-knowledge",
        desc: "Trivia & geography",
        icon: Globe,
      },
    ],
  },
  {
    category: "Activities",
    items: [
      {
        label: "Arts & Crafts",
        href: "/arts",
        desc: "Creative drawing & design",
        icon: Palette,
      },
      {
        label: "Worksheets",
        href: "/worksheets",
        desc: "Printable PDF resources",
        icon: FileText,
      },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLLIElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [kidsMode, setKidsMode] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`navbar-wrapper ${scrolled ? "navbar-wrapper--scrolled" : ""}`}
    >
      <motion.nav
        className={`navbar ${kidsMode ? "navbar--kids-mode" : ""}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <div className="navbar__inner">
          {/* Brand Logo */}
          <Link href="/" className="navbar__logo" aria-label="LearnSpark Home">
            <motion.div
              className="navbar__logo-badge"
              whileHover={{ rotate: 8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={18} className="logo-sparkle" />
            </motion.div>
            <span className="navbar__logo-text">
              Learn<span className="navbar__logo-accent">Spark</span>
            </span>
          </Link>

          {/* Center Navigation Links */}
          <ul className="navbar__links" role="list">
            <li className="navbar__item">
              <Link
                href="/"
                className={`navbar__link ${isActive("/") ? "navbar__link--active" : ""}`}
              >
                Home
                {isActive("/") && (
                  <motion.div
                    className="navbar__active-indicator"
                    layoutId="navbar-active"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>

            {PRIMARY_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href} className="navbar__item">
                  <Link
                    href={link.href}
                    className={`navbar__link ${active ? "navbar__link--active" : ""}`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="navbar__pill-badge">{link.badge}</span>
                    )}
                    {active && (
                      <motion.div
                        className="navbar__active-indicator"
                        layoutId="navbar-active"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Structured Mega-Dropdown */}
            <li className="navbar__item" ref={dropdownRef}>
              <button
                className={`navbar__link navbar__dropdown-trigger ${
                  dropdownOpen ? "navbar__dropdown-trigger--open" : ""
                }`}
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
              >
                <Compass size={15} />
                <span>Explore</span>
                <ChevronDown size={13} className="chevron-icon" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    className="navbar__mega-menu"
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className="mega-menu__grid">
                      {EXPLORE_GROUPS.map((group) => (
                        <div key={group.category} className="mega-menu__column">
                          <span className="mega-menu__label">
                            {group.category}
                          </span>
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="mega-menu__item"
                                onClick={() => setDropdownOpen(false)}
                              >
                                <div className="mega-menu__icon-box">
                                  <Icon size={16} />
                                </div>
                                <div className="mega-menu__text">
                                  <span className="mega-menu__title">
                                    {item.label}
                                  </span>
                                  <span className="mega-menu__desc">
                                    {item.desc}
                                  </span>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>
          <div className="navbar__actions">
            <Link href="/login" className="navbar__cta-btn">
              <span>Sign In</span>
              <ArrowRight size={14} />
            </Link>
            <button
              className="navbar__mobile-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Slide Drawer for Mobile View */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="navbar__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mobile-drawer__header">
                <span className="navbar__logo-text">Navigation</span>
                <button
                  className="navbar__mobile-toggle"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-drawer__content">
                <div className="mobile-drawer__section">
                  <span className="mobile-drawer__label">Main Pages</span>
                  <Link href="/" className="mobile-drawer__link">
                    Home
                  </Link>
                  {PRIMARY_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="mobile-drawer__link"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {EXPLORE_GROUPS.map((group) => (
                  <div key={group.category} className="mobile-drawer__section">
                    <span className="mobile-drawer__label">
                      {group.category}
                    </span>
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="mobile-drawer__link"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mobile-drawer__footer">
                <Link
                  href="/login"
                  className="navbar__cta-btn navbar__cta-btn--full"
                >
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
