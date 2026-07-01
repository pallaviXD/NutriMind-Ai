import { motion } from "framer-motion";
import {
  Users,
  Activity,
  Brain,
  Clock,
} from "lucide-react";

const stats = [
  {
    icon: <Users size={28} />,
    value: "10K+",
    title: "Meals Logged",
    description: "Healthy meals tracked by users",
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: <Activity size={28} />,
    value: "98%",
    title: "Health Accuracy",
    description: "AI-powered nutrition analysis",
    color: "from-emerald-500 to-green-400",
  },
  {
    icon: <Brain size={28} />,
    value: "6",
    title: "AI Health Modes",
    description: "Personalized recommendations",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: <Clock size={28} />,
    value: "<1s",
    title: "AI Response",
    description: "Powered by Groq + Llama",
    color: "from-orange-500 to-red-500",
  },
];

export default function Stats() {
  return (
    <section className="relative py-28 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          transition={{ duration: .7 }}
          className="text-center"
        >

          <span className="inline-block rounded-full bg-violet-500/10 border border-violet-500/20 px-5 py-2 text-violet-300 text-sm">

            Why NutriMind AI?

          </span>

          <h2
            className="
            mt-6
            text-4xl
            md:text-5xl
            font-black
            text-white
            "
          >

            Trusted Health Intelligence

          </h2>

          <p
            className="
            mt-6
            text-slate-400
            max-w-2xl
            mx-auto
            text-lg
            "
          >

            NutriMind AI helps users track nutrition,
            understand their health, and receive
            personalized AI-powered recommendations.

          </p>

        </motion.div>

        {/* Cards */}

        <div
          className="
          mt-20
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-8
          "
        >

          {stats.map((item, index) => (

            <motion.div
              key={item.title}
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                delay: index * .15,
              }}
              whileHover={{
                y: -8,
                scale: 1.03,
              }}
              className="
              group
              rounded-3xl
              border
              border-white/10
              bg-white/5
              backdrop-blur-xl
              p-8
              transition
              duration-300
              hover:border-violet-500/40
              "
            >

              <div
                className={`
                w-16
                h-16
                rounded-2xl
                bg-gradient-to-r
                ${item.color}
                flex
                items-center
                justify-center
                text-white
                `}
              >

                {item.icon}

              </div>

              <h3
                className="
                mt-8
                text-4xl
                font-black
                text-white
                "
              >

                {item.value}

              </h3>

              <h4
                className="
                mt-3
                text-lg
                font-semibold
                text-white
                "
              >

                {item.title}

              </h4>

              <p
                className="
                mt-3
                text-slate-400
                leading-7
                "
              >

                {item.description}

              </p>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}