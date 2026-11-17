"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Sparkles, BookOpen, ArrowLeft } from "lucide-react";
import "@/app/index.css";

export default function LoginClient() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [mode,     setMode]     = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    // Future: call API
  };

  const floats = [
    { emoji: "📚", top: "10%",  left: "5%",  delay: 0   },
    { emoji: "✏️", top: "25%",  left: "90%", delay: 0.5 },
    { emoji: "🔢", top: "60%",  left: "8%",  delay: 1.2 },
    { emoji: "🧩", top: "75%",  left: "88%", delay: 0.8 },
    { emoji: "🌈", top: "88%",  left: "20%", delay: 1.5 },
    { emoji: "⭐", top: "15%",  left: "75%", delay: 0.3 },
    { emoji: "🚀", top: "50%",  left: "93%", delay: 1.8 },
    { emoji: "🎨", top: "40%",  left: "3%",  delay: 1.0 },
  ];

  return (
    <main className="login-page">
      {/* Background floats */}
      <div className="login-page__bg" aria-hidden="true">
        {floats.map((f, i) => (
          <motion.span
            key={i}
            className="login-page__float"
            style={{ top: f.top, left: f.left }}
            animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4 + i * 0.3, delay: f.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {f.emoji}
          </motion.span>
        ))}
      </div>

      {/* Back link */}
      <Link href="/" className="login-page__back">
        <ArrowLeft size={16} /> Back to LearnSpark
      </Link>

      <div className="login-page__center">
        {/* Card */}
        <motion.div
          className="login-card"
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 22 }}
        >
          {/* Logo */}
          <div className="login-card__logo">
            <div className="login-card__logo-icon">
              <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <span className="login-card__logo-text">
              Learn<span className="login-card__logo-spark">Spark</span>
            </span>
          </div>

          {/* Heading */}
          <div className="login-card__heading">
            <h1 className="login-card__title">
              {mode === "login" ? "Welcome back! 👋" : "Join LearnSpark 🌟"}
            </h1>
            <p className="login-card__sub">
              {mode === "login"
                ? "Continue your learning adventure."
                : "Create an account for teachers and parents."}
            </p>
          </div>

          {/* Tabs */}
          <div className="login-card__tabs">
            <button
              className={`login-card__tab${mode === "login" ? " login-card__tab--active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`login-card__tab${mode === "signup" ? " login-card__tab--active" : ""}`}
              onClick={() => setMode("signup")}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="login-form__field">
                <label className="login-form__label" htmlFor="lf-name">Full Name</label>
                <div className="login-form__input-wrap">
                  <input
                    id="lf-name"
                    type="text"
                    className="login-form__input"
                    placeholder="e.g. Sarah Williams"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="login-form__field">
              <label className="login-form__label" htmlFor="lf-email">Email address</label>
              <div className="login-form__input-wrap">
                <Mail size={16} className="login-form__icon" />
                <input
                  id="lf-email"
                  type="email"
                  className="login-form__input login-form__input--icon"
                  placeholder="you@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-form__field">
              <div className="login-form__label-row">
                <label className="login-form__label" htmlFor="lf-password">Password</label>
                {mode === "login" && (
                  <Link href="/forgot-password" className="login-form__forgot">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="login-form__input-wrap">
                <Lock size={16} className="login-form__icon" />
                <input
                  id="lf-password"
                  type={showPw ? "text" : "password"}
                  className="login-form__input login-form__input--icon login-form__input--pr"
                  placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  className="login-form__toggle-pw"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="login-form__field">
                <label className="login-form__label" htmlFor="lf-role">I am a...</label>
                <select id="lf-role" className="login-form__select">
                  <option value="">Select role</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="school">School Administrator</option>
                </select>
              </div>
            )}

            <motion.button
              type="submit"
              className="login-form__submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <span className="login-form__loading">
                  <span className="login-spinner" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <>
                  <Sparkles size={16} />
                  {mode === "login" ? "Login" : "Create Account"}
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="login-card__divider">
            <span>or continue as</span>
          </div>

          {/* Guest option */}
          <Link href="/math/odd-even" className="login-card__guest">
            🎒 Continue without account
          </Link>

          {/* Switch mode */}
          <p className="login-card__switch">
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <button className="login-card__switch-btn" onClick={() => setMode("signup")}>
                  Create account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button className="login-card__switch-btn" onClick={() => setMode("login")}>
                  Login
                </button>
              </>
            )}
          </p>
        </motion.div>

        {/* Side features */}
        <motion.div
          className="login-features"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="login-features__title">For Teachers &amp; Parents</h2>
          {[
            { icon: "✨", title: "Create & Save Worksheets",    desc: "Build personalised worksheets and save them to your account." },
            { icon: "📋", title: "Assign to Students",          desc: "Share worksheets directly with students or print for class." },
            { icon: "📊", title: "Track Progress",              desc: "See how students are progressing across topics." },
            { icon: "🌍", title: "Multi-Language Support",      desc: "Create worksheets in multiple languages." },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="login-features__item"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span className="login-features__icon">{f.icon}</span>
              <div>
                <h3 className="login-features__item-title">{f.title}</h3>
                <p className="login-features__item-desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
}
