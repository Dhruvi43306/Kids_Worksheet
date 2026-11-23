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
  PenTool,
  Globe,
  Palette,
  Gamepad2,
  Brain,
  ArrowRight,
  Mail,
  Users,
  Calculator,
} from "lucide-react";
import "@/app/components/components.css";

// Keep Math as the existing direct navigation link.
const PRIMARY_LINKS = [
  { label: "Math", href: "/math", icon: Calculator },
];

// Each group has its own independent dropdown.
const NAVBAR_GROUPS = [
  {
    category: "LEARNING RESOURCES",
    title: "Build knowledge every day",
    description: "Explore helpful resources that make learning easier and more enjoyable.",
    // footer: "Discover something new to learn",
    items: [
      {
        label: "Reading",
        href: "/reading",
        desc: "Stories, reading comprehension and phonics",
        // detail: "Read, understand and grow your vocabulary.",
        icon: BookOpen,
        number: "01",
      },
      {
        label: "Writing",
        href: "/writing",
        desc: "Grammar, vocabulary and essay skills",
        // detail: "Build confidence with words and sentences.",
        icon: PenTool,
        number: "02",
      },
      {
        label: "General Knowledge",
        href: "/general-knowledge",
        desc: "Trivia, geography and the world around us",
        // detail: "Discover interesting facts about our world.",
        icon: Globe,
        number: "03",
      },
    ],
  },
  {
    category: "FUN ACTIVITIES",
    title: "Make learning an adventure",
    description: "Create, play and challenge your thinking with fun activities.",
    footer: "Learn something while having fun",
    items: [
      {
        label: "Arts & Crafts",
        href: "/arts",
        desc: "Creative drawing, colouring and design",
        detail: "Bring your imagination to life.",
        icon: Palette,
        number: "01",
      },
      {
        label: "Learning Games",
        href: "/learning-games",
        desc: "Interactive games for learning and practice",
        detail: "Practice new skills through play.",
        icon: Gamepad2,
        number: "02",
      },
      {
        label: "Brain Challenge",
        href: "/brain-challenge",
        desc: "Logic, memory and problem-solving puzzles",
        detail: "Think smart and challenge yourself.",
        icon: Brain,
        number: "03",
      },
    ],
  },
];

const ADDITIONAL_LINKS = [
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "For Everyone", href: "/for-everyone", icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();
  const navigationRef = useRef<HTMLUListElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [kidsMode, setKidsMode] = useState(false);

  // Keep the existing sticky-navbar scroll behaviour.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close navigation menus after changing pages.
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Close dropdowns when clicking outside or pressing Escape.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
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

  const toggleDropdown = (category: string) => {
    setOpenDropdown((current) => (current === category ? null : category));
  };

  return (
    <header
      className={`navbar-wrapper ${
        scrolled ? "navbar-wrapper--scrolled" : ""
      }`}
    >
      <motion.nav
        className={`navbar ${kidsMode ? "navbar--kids-mode" : ""}`}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <div className="navbar__inner">
          {/* Brand logo */}
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

          {/* Desktop navigation */}
          <ul className="navbar__links" role="list" ref={navigationRef}>
            {/* Home */}
            <li className="navbar__item">
              <Link
                href="/"
                className={`navbar__link ${
                  isActive("/") ? "navbar__link--active" : ""
                }`}
              >
                Home
                {isActive("/") && (
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

            {/* Math — existing direct route remains unchanged */}
            {PRIMARY_LINKS.map((link) => {
              const active = isActive(link.href);

              return (
                <li key={link.href} className="navbar__item">
                  <Link
                    href={link.href}
                    className={`navbar__link ${
                      active ? "navbar__link--active" : ""
                    }`}
                  >
                    <span>{link.label}</span>
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

            {/* Learning Resources and Fun Activities dropdowns */}
            {NAVBAR_GROUPS.map((group, index) => {
              const GroupIcon = index === 0 ? BookOpen : Sparkles;
              const isOpen = openDropdown === group.category;
              const menuId = `learnspark-menu-${index}`;

              return (
                <li
                  key={group.category}
                  className="navbar__item learnspark-nav-dropdown-item"
                >
                  <button
                    type="button"
                    className={`navbar__link navbar__dropdown-trigger learnspark-nav-dropdown-trigger ${
                      isOpen ? "navbar__dropdown-trigger--open" : ""
                    }`}
                    onClick={() => toggleDropdown(group.category)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={menuId}
                  >
                    <GroupIcon size={15} />
                    <span>{group.category}</span>
                    <ChevronDown
                      size={13}
                      className={`chevron-icon ${
                        isOpen ? "learnspark-chevron-open" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={menuId}
                        role="menu"
                        className="navbar__mega-menu learnspark-nav-dropdown"
                        initial={{ opacity: 0, y: 10, scale: 0.985 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.985 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <div className="learnspark-dropdown-header">
                          <div className="learnspark-dropdown-heading">
                            <span className="learnspark-dropdown-eyebrow">
                              {group.category}
                            </span>
                            <h3>{group.title}</h3>
                            <p>{group.description}</p>
                          </div>

                          <div className="learnspark-dropdown-sparkle" aria-hidden="true">
                            <Sparkles size={25} />
                          </div>
                        </div>

                        <div className="learnspark-dropdown-items">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                role="menuitem"
                                className={`mega-menu__item learnspark-dropdown-card ${
                                  active ? "learnspark-dropdown-card--active" : ""
                                }`}
                                onClick={() => setOpenDropdown(null)}
                              >
                                <span className="learnspark-dropdown-number">
                                  {item.number}
                                </span>

                                {/* <span className="mega-menu__icon-box learnspark-dropdown-icon">
                                  <Icon size={19} />
                                </span> */}

                                <span className="mega-menu__text learnspark-dropdown-copy">
                                  <span className="mega-menu__title learnspark-dropdown-title">
                                    {item.label}
                                  </span>
                                  <span className="mega-menu__desc learnspark-dropdown-description">
                                    {item.desc}
                                  </span>
                                  {/* <span className="learnspark-dropdown-detail">
                                    {item.detail}
                                  </span> */}
                                </span>

                                <ArrowRight
                                  size={16}
                                  className="learnspark-dropdown-arrow"
                                />
                              </Link>
                            );
                          })}
                        </div>

                        {/* <div className="learnspark-dropdown-footer">
                          <span className="learnspark-dropdown-footer-icon">
                            <Sparkles size={14} />
                          </span>
                          <span>{group.footer}</span>
                        </div> */}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}

            {/* Contact and For Everyone */}
            {ADDITIONAL_LINKS.map((link) => {
              const active = isActive(link.href);

              return (
                <li key={link.href} className="navbar__item">
                  <Link
                    href={link.href}
                    className={`navbar__link ${
                      active ? "navbar__link--active" : ""
                    }`}
                  >
                    <span>{link.label}</span>
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
          </ul>

          {/* Sign in and mobile toggle */}
          <div className="navbar__actions">
            <Link href="/login" className="navbar__cta-btn">
              <span>Sign In</span>
              <ArrowRight size={14} />
            </Link>

            <button
              className="navbar__mobile-toggle"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile slide drawer */}
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
                  aria-label="Close Navigation"
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

                {NAVBAR_GROUPS.map((group) => (
                  <div
                    key={group.category}
                    className="mobile-drawer__section"
                  >
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

                <div className="mobile-drawer__section">
                  <span className="mobile-drawer__label">
                    More Information
                  </span>

                  {ADDITIONAL_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="mobile-drawer__link"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
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
