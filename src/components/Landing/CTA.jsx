import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  {
    value: "10K+",
    label: "Meals Logged",
  },
  {
    value: "98%",
    label: "AI Accuracy",
  },
  {
    value: "24/7",
    label: "AI Support",
  },
  {
    value: "Free",
    label: "Forever",
  },
];

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-32 px-6">

      {/* Background */}

      <div className="absolute inset-0 -z-10">

        <div className="absolute left-1/2 top-10 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute left-20 bottom-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute right-20 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />

      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: .7 }}
        className="
        mx-auto
        max-w-6xl
        rounded-[40px]
        border
        border-white/10
        bg-white/5
        backdrop-blur-2xl
        px-8
        py-20
        md:px-20
        text-center
        "
      >

        {/* Badge */}

        <div
          className="
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-violet-500/20
          bg-violet-500/10
          px-6
          py-3
          text-sm
          font-semibold
          text-violet-300
          "
        >

          <Sparkles size={16} />

          Join NutriMind AI Today

        </div>

        {/* Heading */}

        <h2
          className="
          mx-auto
          mt-10
          max-w-4xl
          text-5xl
          font-black
          leading-[1.05]
          tracking-tight
          text-white
          md:text-7xl
          "
        >

          Transform Your Health

          <br />

          With AI Nutrition.

        </h2>

        {/* Description */}

        <p
          className="
          mx-auto
          mt-8
          max-w-2xl
          text-lg
          leading-8
          text-slate-400
          md:text-xl
          "
        >

          Track meals, analyze nutrition, receive personalized
          AI recommendations, and achieve your health goals—
          all from one intelligent platform.

        </p>

        {/* Trust */}

        <div
          className="
          mt-8
          flex
          flex-wrap
          justify-center
          gap-6
          text-sm
          text-slate-400
          "
        >

          <div className="flex items-center gap-2">

            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            No Credit Card

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            Free Forever

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle2
              size={18}
              className="text-emerald-400"
            />

            AI Powered

          </div>

        </div>

        {/* Buttons */}

        <div
          className="
          mt-14
          flex
          flex-col
          items-center
          justify-center
          gap-5
          sm:flex-row
          "
        >

          <Link
            to="/signup"
            className="
            group
            inline-flex
            h-14
            min-w-[220px]
            items-center
            justify-center
            gap-3
            rounded-full
            bg-gradient-to-r
            from-violet-600
            via-cyan-500
            to-emerald-500
            px-8
            font-semibold
            text-white
            shadow-xl
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-cyan-500/30
            "
          >

            Start Free

            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />

          </Link>

          <Link
            to="/login"
            className="
            inline-flex
            h-14
            min-w-[220px]
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-white/5
            px-8
            font-medium
            text-white
            backdrop-blur-xl
            transition-all
            duration-300
            hover:border-cyan-400
            hover:bg-white/10
            "
          >

            Sign In

          </Link>

        </div>

        {/* Stats */}

        <div
          className="
          mt-20
          grid
          gap-6
          grid-cols-2
          md:grid-cols-4
          "
        >

          {stats.map((item) => (

            <motion.div
              whileHover={{
                y: -6,
              }}
              key={item.label}
              className="
              rounded-3xl
              border
              border-white/10
              bg-white/5
              p-6
              backdrop-blur-xl
              "
            >

              <h3
                className="
                text-4xl
                font-black
                text-white
                "
              >

                {item.value}

              </h3>

              <p
                className="
                mt-3
                text-slate-400
                "
              >

                {item.label}

              </p>

            </motion.div>

          ))}

        </div>

      </motion.div>
    </section>
  );
}