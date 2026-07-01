import { motion } from "framer-motion";
import {
  Bot,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const chats = [
  {
    type: "user",
    text: "I had 2 rotis, dal, rice and salad for lunch.",
  },
  {
    type: "ai",
    text: "Great choice! I've logged approximately 650 kcal. Your protein intake increased by 24g and you're still within today's calorie target.",
  },
  {
    type: "user",
    text: "Suggest a healthy dinner.",
  },
  {
    type: "ai",
    text: "Based on today's nutrition, I recommend grilled paneer, sautéed vegetables, and brown rice. This will help you complete your protein goal.",
  },
];

export default function AIChatDemo() {
  return (
    <section
      id="chat"
      className="relative py-28 px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-sm text-cyan-300">
            <Sparkles size={16} />
            AI Conversation
          </span>

          <h2 className="mt-6 text-4xl md:text-6xl font-black text-white">
            Just Chat.
            <br />
            NutriMind Does The Rest.
          </h2>

          <p className="mt-6 text-slate-400 max-w-3xl mx-auto text-lg">
            No complicated forms. Simply describe your meals,
            ask health questions, or request recipes.
            NutriMind AI understands natural language instantly.
          </p>
        </motion.div>

        <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            className="space-y-8"
          >

            <div>
              <h3 className="text-3xl font-bold text-white">
                Your Personal AI Nutrition Coach
              </h3>

              <p className="mt-5 text-slate-400 leading-8">
                NutriMind understands everyday language.
                Whether you ate homemade food, restaurant meals,
                or snacks, our AI instantly estimates calories,
                nutrition, and provides healthier recommendations.
              </p>
            </div>

            {[
              "Natural language meal logging",
              "Personalized nutrition advice",
              "Healthy recipe generation",
              "Daily calorie tracking",
              "Health condition awareness",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
                <CheckCircle2
                  size={22}
                  className="text-emerald-400"
                />

                <span className="text-slate-300">
                  {item}
                </span>
              </div>
            ))}

            <button className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-7 py-4 text-white font-semibold">
              Try AI Chat

              <ArrowRight size={18} />
            </button>

          </motion.div>

          {/* Chat Window */}

          <motion.div
            initial={{
              opacity: 0,
              x: 40,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{ once: true }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
          >

            <div className="flex items-center justify-between border-b border-white/10 pb-5">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">

                  <Bot className="text-white" />

                </div>

                <div>

                  <h3 className="text-white font-semibold">
                    NutriMind AI
                  </h3>

                  <p className="text-sm text-emerald-400">
                    Online
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-8 space-y-5">

              {chats.map((chat, index) => (

                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * .25,
                  }}
                  className={`flex ${
                    chat.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-sm rounded-3xl px-5 py-4 ${
                      chat.type === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >

                    <div className="flex items-start gap-3">

                      {chat.type === "ai" ? (
                        <Bot size={20} />
                      ) : (
                        <User size={20} />
                      )}

                      <span>{chat.text}</span>

                    </div>

                  </div>

                </motion.div>

              ))}

            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}