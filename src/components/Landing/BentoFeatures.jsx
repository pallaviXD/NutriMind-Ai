import { motion } from "framer-motion";
import {
  Brain,
  MessageSquare,
  Salad,
  Activity,
  Dumbbell,
  Droplets,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    title: "AI Nutrition Coach",
    description:
      "Chat naturally with NutriMind AI and instantly receive personalized meal recommendations, calorie estimates, and health advice.",
    icon: Brain,
    gradient: "from-violet-500 to-fuchsia-500",
    size: "lg:col-span-2 lg:row-span-2",
  },

  {
    title: "Meal Tracking",
    description:
      "Log meals using natural language without manually entering calories.",
    icon: MessageSquare,
    gradient: "from-cyan-500 to-blue-500",
    size: "",
  },

  {
    title: "Healthy Recipes",
    description:
      "Generate AI-powered recipes using ingredients available in your kitchen.",
    icon: Salad,
    gradient: "from-emerald-500 to-green-500",
    size: "",
  },

  {
    title: "Health Analytics",
    description:
      "Track calories, BMI, weight, macros, and nutrition trends through beautiful dashboards.",
    icon: Activity,
    gradient: "from-orange-500 to-red-500",
    size: "lg:col-span-2",
  },

  {
    title: "Workout Planner",
    description:
      "Personalized workouts generated according to your body type and goals.",
    icon: Dumbbell,
    gradient: "from-pink-500 to-rose-500",
    size: "",
  },

  {
    title: "Water Reminder",
    description:
      "Stay hydrated with AI reminders and smart hydration tracking.",
    icon: Droplets,
    gradient: "from-sky-500 to-cyan-500",
    size: "",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-28 px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-5 py-2 text-sm text-violet-300">

            Powerful AI Features

          </span>

          <h2
            className="
            mt-6
            text-4xl
            md:text-6xl
            font-black
            text-white
            "
          >
            Everything You Need

            <br />

            For Better Health
          </h2>

          <p
            className="
            mt-6
            max-w-3xl
            mx-auto
            text-slate-400
            text-lg
            "
          >
            NutriMind AI combines artificial intelligence,
            nutrition science, and health analytics into
            one intelligent platform.
          </p>

        </motion.div>

        {/* Bento Grid */}

        <div
          className="
          mt-20
          grid
          lg:grid-cols-4
          gap-6
          auto-rows-[280px]
          "
        >

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (

              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: index * .1,
                }}
                whileHover={{
                  y: -10,
                }}
                className={`
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-white/10
                bg-white/5
                backdrop-blur-xl
                p-8
                ${feature.size}
                `}
              >

                {/* Background Glow */}

                <div
                  className={`
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  transition
                  duration-500
                  bg-gradient-to-br
                  ${feature.gradient}
                  blur-3xl
                  `}
                />

                <div className="relative z-10">

                  <div
                    className={`
                    w-16
                    h-16
                    rounded-2xl
                    bg-gradient-to-r
                    ${feature.gradient}
                    flex
                    items-center
                    justify-center
                    text-white
                    `}
                  >

                    <Icon size={30} />

                  </div>

                  <h3
                    className="
                    mt-8
                    text-2xl
                    font-bold
                    text-white
                    "
                  >
                    {feature.title}
                  </h3>

                  <p
                    className="
                    mt-5
                    text-slate-400
                    leading-8
                    "
                  >
                    {feature.description}
                  </p>

                  <button
                    className="
                    mt-8
                    flex
                    items-center
                    gap-2
                    text-violet-300
                    group-hover:text-white
                    transition
                    "
                  >

                    Learn More

                    <ArrowRight
                      size={18}
                      className="
                      group-hover:translate-x-1
                      transition
                      "
                    />

                  </button>

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>
    </section>
  );
}