import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Activity, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "Dashboard",
    href: "#dashboard",
  },
  {
    name: "How it Works",
    href: "#how",
  },
  {
    name: "Testimonials",
    href: "#testimonials",
  },
  {
    name: "FAQ",
    href: "#faq",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{
          y: -80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.6,
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-2xl bg-black/40 border-b border-white/10 shadow-xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{
                rotate: 360,
              }}
              transition={{
                duration: 0.8,
              }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg"
            >
              <Activity className="text-white" size={24} />
            </motion.div>

            <div>
              <h1 className="font-black text-xl text-white">
                NutriMind
              </h1>

              <p className="text-xs text-slate-400">
                AI Health Assistant
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative text-slate-300 hover:text-white transition duration-300 group"
              >
                {item.name}

                <span
                  className="absolute left-0 -bottom-2 h-[2px] w-0 bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-300 group-hover:w-full"
                />
              </a>
            ))}
          </div>

          {/* Desktop Buttons */}

          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="group relative overflow-hidden rounded-full px-6 py-3 font-semibold text-white bg-gradient-to-r from-violet-600 to-cyan-500"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free

                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition"
                />
              </span>

              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700" />
            </Link>
          </div>

          {/* Mobile Button */}

          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white"
          >
            <Menu size={30} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] bg-[#050816]"
          >
            <div className="flex justify-between items-center px-6 py-6 border-b border-white/10">
              <h2 className="text-white text-2xl font-bold">
                NutriMind
              </h2>

              <button
                onClick={() => setMobileOpen(false)}
              >
                <X
                  size={32}
                  className="text-white"
                />
              </button>
            </div>

            <div className="flex flex-col mt-10 px-8">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-5 border-b border-white/5 text-xl text-slate-300 hover:text-white transition"
                >
                  {item.name}
                </a>
              ))}

              <Link
                to="/login"
                className="mt-10 text-center py-4 rounded-xl border border-white/10 text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="mt-5 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-center text-white font-semibold"
              >
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}