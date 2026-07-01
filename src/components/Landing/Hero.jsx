<section className="relative min-h-screen overflow-hidden">

    <AuroraBackground />

    <FloatingCards />

    <div className="relative z-10">
        ...
    </div>

</section>

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

import AuroraBackground from "./AuroraBackground";
import FloatingCards from "./FloatingCards";
import HeroDashboard from "./HeroDashboard";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden flex items-center justify-center">

      {/* Aurora Background */}

      <AuroraBackground />

      {/* Floating Cards */}

      <FloatingCards />

      {/* Hero Content */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

        {/* Badge */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2">

            <Sparkles
              size={16}
              className="text-violet-400"
            />

            <span className="text-sm text-violet-300 font-medium">

              AI Powered Nutrition Platform

            </span>

          </div>
        </motion.div>

        {/* Heading */}

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: .2,
            duration: .8
          }}
          className="
          text-center
          mt-10
          text-5xl
          md:text-7xl
          font-black
          leading-tight
          text-white
          "
        >

          Your Personal

          <br />

          <span
            className="
            bg-gradient-to-r
            from-violet-400
            via-cyan-400
            to-emerald-400
            bg-clip-text
            text-transparent
            "
          >

            AI Health Assistant

          </span>

        </motion.h1>

        {/* Description */}

        <motion.p
          initial={{
            opacity:0,
            y:20
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            delay:.4
          }}
          className="
          mt-8
          text-center
          max-w-3xl
          mx-auto
          text-lg
          md:text-xl
          text-slate-400
          leading-8
          "
        >

          Track meals, monitor nutrition, generate AI recipes,
          receive personalized health insights, and achieve your
          wellness goals — all in one intelligent platform.

        </motion.p>

        {/* Buttons */}

        <motion.div
          initial={{
            opacity:0,
            y:20
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            delay:.6
          }}
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
            px-8
            py-4
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            font-semibold
            text-white
            shadow-xl
            hover:scale-105
            transition
            flex
            items-center
            justify-center
            gap-2
            "
          >

            Start Free

            <ArrowRight
              size={18}
              className="
              group-hover:translate-x-1
              transition
              "
            />

          </Link>

          <Link
            to="/login"
            className="
            rounded-full
            border
            border-white/10
            px-8
            py-4
            text-white
            hover:bg-white/5
            transition
            "
          >

            Live Demo

          </Link>

        </motion.div>

        {/* Trust */}

        <motion.div
          initial={{
            opacity:0
          }}
          animate={{
            opacity:1
          }}
          transition={{
            delay:1
          }}
          className="
          mt-10
          flex
          flex-wrap
          justify-center
          gap-6
          text-sm
          text-slate-400
          "
        >

          <div className="flex items-center gap-2">

            <CheckCircle
              size={16}
              className="text-emerald-400"
            />

            Free Forever

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle
              size={16}
              className="text-emerald-400"
            />

            AI Powered

          </div>

          <div className="flex items-center gap-2">

            <CheckCircle
              size={16}
              className="text-emerald-400"
            />

            No Credit Card

          </div>

        </motion.div>

        {/* Dashboard */}

        <motion.div
          initial={{
            opacity:0,
            y:50
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            delay:1.2,
            duration:1
          }}
          className="mt-20"
        >

          <HeroDashboard />

        </motion.div>

      </div>

    </section>
  );
}