import { motion } from "framer-motion";
import {
  Activity,
  Flame,
  Droplets,
  Brain,
  Heart,
  TrendingUp,
  Salad,
  Moon,
} from "lucide-react";

const progress = [
  {
    title: "Calories",
    value: "1650",
    total: "2000",
    percent: 82,
    color: "from-orange-500 to-red-500",
    icon: <Flame size={18} />,
  },
  {
    title: "Protein",
    value: "92g",
    total: "120g",
    percent: 77,
    color: "from-emerald-500 to-green-400",
    icon: <Salad size={18} />,
  },
  {
    title: "Water",
    value: "2.8L",
    total: "3L",
    percent: 93,
    color: "from-cyan-500 to-sky-400",
    icon: <Droplets size={18} />,
  },
];

const meals = [
  {
    meal: "Breakfast",
    item: "Oats + Banana",
    kcal: "420 kcal",
  },
  {
    meal: "Lunch",
    item: "Dal + Rice + Salad",
    kcal: "610 kcal",
  },
  {
    meal: "Dinner",
    item: "Grilled Chicken",
    kcal: "620 kcal",
  },
];

export default function HeroDashboard() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.8,
      }}
      whileHover={{
        rotateX: 3,
        rotateY: -3,
      }}
      className="relative w-full max-w-6xl mx-auto"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,.45)] overflow-hidden">

        {/* Header */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 py-6 border-b border-white/10">

          <div>
            <h2 className="text-2xl font-bold text-white">
              Today's Dashboard
            </h2>

            <p className="text-slate-400 mt-1">
              Your AI-powered health summary
            </p>
          </div>

          <div className="mt-5 md:mt-0 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-sm text-emerald-300">
              Healthy Progress
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 p-8">

          {/* LEFT */}

          <div className="space-y-6">

            {progress.map((item) => (

              <motion.div
                key={item.title}
                whileHover={{
                  scale: 1.02,
                }}
                className="rounded-2xl bg-white/5 border border-white/10 p-5"
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center`}
                    >
                      {item.icon}
                    </div>

                    <div>

                      <p className="text-white font-semibold">
                        {item.title}
                      </p>

                      <p className="text-sm text-slate-400">
                        {item.value} / {item.total}
                      </p>

                    </div>

                  </div>

                  <span className="text-white font-bold">
                    {item.percent}%
                  </span>

                </div>

                <div className="mt-4 h-3 rounded-full bg-slate-800 overflow-hidden">

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${item.percent}%`,
                    }}
                    transition={{
                      duration: 1.5,
                    }}
                    className={`h-full bg-gradient-to-r ${item.color}`}
                  />

                </div>

              </motion.div>

            ))}

          </div>

          {/* CENTER */}

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

            <div className="flex items-center justify-between">

              <h3 className="text-white font-semibold">
                Weight Progress
              </h3>

              <TrendingUp className="text-emerald-400" size={18} />

            </div>

            <div className="mt-8 flex items-end justify-between h-52">

              {[45, 62, 55, 80, 70, 90, 75].map((height, index) => (

                <motion.div
                  key={index}
                  initial={{
                    height: 0,
                  }}
                  animate={{
                    height: `${height}%`,
                  }}
                  transition={{
                    delay: index * 0.15,
                    duration: 1,
                  }}
                  className="w-8 rounded-t-xl bg-gradient-to-t from-violet-600 via-cyan-500 to-emerald-400"
                />

              ))}

            </div>

            <div className="mt-6 flex justify-between text-sm text-slate-500">

              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>

            </div>

          </div>

          {/* RIGHT */}

          <div className="space-y-6">

            <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/10 border border-violet-500/20 p-6">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center">

                  <Brain className="text-white" size={20} />

                </div>

                <div>

                  <h3 className="text-white font-semibold">
                    AI Insight
                  </h3>

                  <p className="text-sm text-slate-400">
                    Personalized Recommendation
                  </p>

                </div>

              </div>

              <p className="mt-5 text-slate-300 leading-7">

                Excellent work today!

                <br />

                Your protein intake is almost complete.

                Increase water intake by 200ml before bedtime and include one fruit after dinner.

              </p>

            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">

              <div className="flex items-center justify-between">

                <h3 className="text-white font-semibold">
                  Today's Meals
                </h3>

                <Moon className="text-cyan-400" size={18} />

              </div>

              <div className="mt-5 space-y-5">

                {meals.map((meal) => (

                  <div
                    key={meal.meal}
                    className="flex justify-between items-center"
                  >

                    <div>

                      <p className="text-white text-sm font-medium">
                        {meal.meal}
                      </p>

                      <p className="text-slate-400 text-sm">
                        {meal.item}
                      </p>

                    </div>

                    <span className="text-cyan-400 text-sm">
                      {meal.kcal}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="grid md:grid-cols-3 border-t border-white/10">

          <div className="p-6 flex items-center gap-4">

            <Heart className="text-red-400" />

            <div>

              <p className="text-slate-400 text-sm">
                Heart Rate
              </p>

              <h3 className="text-white text-xl font-bold">
                72 BPM
              </h3>

            </div>

          </div>

          <div className="p-6 flex items-center gap-4 border-y md:border-y-0 md:border-x border-white/10">

            <Activity className="text-emerald-400" />

            <div>

              <p className="text-slate-400 text-sm">
                BMI
              </p>

              <h3 className="text-white text-xl font-bold">
                22.4
              </h3>

            </div>

          </div>

          <div className="p-6 flex items-center gap-4">

            <TrendingUp className="text-violet-400" />

            <div>

              <p className="text-slate-400 text-sm">
                Weekly Goal
              </p>

              <h3 className="text-white text-xl font-bold">
                94%
              </h3>

            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
}