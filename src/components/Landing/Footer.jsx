import { Link } from "react-router-dom";
import {
  Activity,
  Mail,
  Heart,
  ArrowUpRight,
} from "lucide-react";

export default function Footer() {
  const quickLinks = [
    {
      name: "Features",
      href: "#features",
    },
    {
      name: "Dashboard",
      href: "#dashboard",
    },
    {
      name: "AI Chat",
      href: "#chat",
    },
    {
      name: "FAQ",
      href: "#faq",
    },
  ];

  const resources = [
    {
      name: "Login",
      path: "/login",
    },
    {
      name: "Sign Up",
      path: "/signup",
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050816] px-6 py-16">

      {/* Background Glow */}

      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Logo */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500">

                <Activity className="text-white" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-white">

                  NutriMind AI

                </h2>

                <p className="text-sm text-slate-400">

                  AI Health Assistant

                </p>

              </div>

            </div>

            <p className="mt-6 leading-7 text-slate-400">

              NutriMind AI is your intelligent nutrition companion.
              Track meals, monitor health, generate recipes,
              and receive personalized AI-powered guidance.

            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-lg font-semibold text-white">

              Quick Links

            </h3>

            <div className="mt-6 flex flex-col gap-4">

              {quickLinks.map((item) => (

                <a
                  key={item.name}
                  href={item.href}
                  className="text-slate-400 transition hover:text-white"
                >
                  {item.name}
                </a>

              ))}

            </div>

          </div>

          {/* Resources */}

          <div>

            <h3 className="text-lg font-semibold text-white">

              Resources

            </h3>

            <div className="mt-6 flex flex-col gap-4">

              {resources.map((item) => (

                <Link
                  key={item.name}
                  to={item.path}
                  className="text-slate-400 transition hover:text-white"
                >
                  {item.name}
                </Link>

              ))}

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-lg font-semibold text-white">

              Connect

            </h3>

            <div className="mt-6 space-y-5">

              <a
                href="mailto:your@email.com"
                className="flex items-center gap-3 text-slate-400 transition hover:text-white"
              >

                <Mail size={20} />

                Contact

              </a>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row">

          <p className="text-sm text-slate-500">

            © {new Date().getFullYear()} NutriMind AI.
            All rights reserved.

          </p>

          <div className="flex items-center gap-2 text-sm text-slate-500">

            Built with

            <Heart
              size={16}
              className="fill-red-500 text-red-500"
            />

            using React & Tailwind CSS

          </div>

        </div>

      </div>

    </footer>
  );
}