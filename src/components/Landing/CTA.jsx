import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">

      {/* Background Glow */}

      <div className="absolute inset-0">

        <div className="absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute left-1/3 top-24 h-56 w-56 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute right-1/3 bottom-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-[120px]" />

      </div>

      <div className="relative z-10 mx-auto max-w-6xl">

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="
          rounded-[40px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          p-12
          md:p-20
          text-center
          "
        >

          {/* Badge */}

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-5 py-2 text-sm text-violet-300">

            <Sparkles size={16} />

            Join NutriMind AI Today

          </div>

          {/* Heading */}

          <h2
            className="
            mt-8
            text-4xl
            md:text-6xl
            font-black
            text-white
            leading-tight
            "
          >
            Your Health Journey

            <br />

            Starts Today.
          </h2>

          {/* Description */}

          <p
            className="
            mt-8
            mx-auto
            max-w-3xl
            text-lg
            leading-8
            text-slate-400
            "
          >
            Track meals, receive AI nutrition guidance,
            generate healthy recipes, monitor your health,
            and achieve your wellness goals—all from one
            intelligent platform.
          </p>

          {/* Buttons */}

          <div
            className="
            mt-12
            flex
            flex-col
            sm:flex-row
            justify-center
            gap-5
            "
          >

            <Link
              to="/signup"
              className="
              group
              rounded-full
              bg-gradient-to-r
              from-violet-600
              via-cyan-500
              to-emerald-500
              px-9
              py-4
              text-white
              font-semibold
              transition
              hover:scale-105
              flex
              items-center
              justify-center
              gap-3
              "
            >

              Start Free

              <ArrowRight
                size={18}
                className="
                transition
                group-hover:translate-x-1
                "
              />

            </Link>

            <Link
              to="/login"
              className="
              rounded-full
              border
              border-white/10
              px-9
              py-4
              text-white
              hover:bg-white/10
              transition
              "
            >

              Sign In

            </Link>

          </div>

          {/* Bottom Stats */}

          <div
            className="
            mt-14
            grid
            grid-cols-2
            md:grid-cols-4
            gap-8
            "
          >

            <div>

              <h3 className="text-3xl font-black text-white">

                10K+

              </h3>

              <p className="mt-2 text-slate-400">

                Meals Logged

              </p>

            </div>

            <div>

              <h3 className="text-3xl font-black text-white">

                98%

              </h3>

              <p className="mt-2 text-slate-400">

                Accuracy

              </p>

            </div>

            <div>

              <h3 className="text-3xl font-black text-white">

                24/7

              </h3>

              <p className="mt-2 text-slate-400">

                AI Support

              </p>

            </div>

            <div>

              <h3 className="text-3xl font-black text-white">

                Free

              </h3>

              <p className="mt-2 text-slate-400">

                To Start

              </p>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}