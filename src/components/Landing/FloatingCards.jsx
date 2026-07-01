import { motion } from "framer-motion";
import { Heart, Flame, Droplets, Salad } from "lucide-react";

const cards = [
  {
    title: "Heart Rate",
    value: "72 BPM",
    icon: Heart,
    color: "text-red-400",
    position: "top-24 left-8",
  },
  {
    title: "Calories",
    value: "1650 kcal",
    icon: Flame,
    color: "text-orange-400",
    position: "top-40 right-8",
  },
  {
    title: "Water",
    value: "2.8 L",
    icon: Droplets,
    color: "text-cyan-400",
    position: "bottom-32 left-10",
  },
  {
    title: "Protein",
    value: "92 g",
    icon: Salad,
    color: "text-emerald-400",
    position: "bottom-24 right-10",
  },
];

export default function FloatingCards() {
  return (
    <>
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: index * 0.5,
            }}
            className={`absolute ${card.position} hidden xl:block z-20`}
          >
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl px-5 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <Icon className={card.color} size={22} />
                <div>
                  <p className="text-xs text-slate-400">
                    {card.title}
                  </p>
                  <h4 className="text-white font-semibold">
                    {card.value}
                  </h4>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}