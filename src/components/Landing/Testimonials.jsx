import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Fitness Enthusiast",
    image: "https://i.pravatar.cc/150?img=11",
    review:
      "NutriMind AI completely changed how I track my meals. The AI suggestions are accurate and the dashboard is beautiful.",
  },
  {
    name: "Priya Patel",
    role: "Working Professional",
    image: "https://i.pravatar.cc/150?img=32",
    review:
      "I love that I can simply chat with the AI instead of manually entering calories. It saves so much time every day.",
  },
  {
    name: "Aman Verma",
    role: "Gym Trainer",
    image: "https://i.pravatar.cc/150?img=14",
    review:
      "The workout recommendations and nutrition insights are surprisingly useful. This feels like having a personal nutrition coach.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-28 px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-300">

            Testimonials

          </span>

          <h2 className="mt-6 text-4xl md:text-6xl font-black text-white">

            Loved by Health Enthusiasts

          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-slate-400 text-lg">

            Thousands of people trust NutriMind AI to improve
            their nutrition, fitness, and overall lifestyle.

          </p>

        </motion.div>

        {/* Cards */}

        <div className="mt-20 grid lg:grid-cols-3 gap-8">

          {testimonials.map((item, index) => (

            <motion.div
              key={item.name}
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
                delay: index * 0.15,
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
              }}
              className="
              relative
              rounded-3xl
              border
              border-white/10
              bg-white/5
              backdrop-blur-xl
              p-8
              overflow-hidden
              "
            >

              <Quote
                size={50}
                className="
                absolute
                top-6
                right-6
                text-white/5
                "
              />

              {/* Stars */}

              <div className="flex gap-1">

                {[...Array(5)].map((_, i) => (

                  <Star
                    key={i}
                    size={18}
                    fill="#facc15"
                    className="text-yellow-400"
                  />

                ))}

              </div>

              {/* Review */}

              <p
                className="
                mt-6
                text-slate-300
                leading-8
                "
              >
                "{item.review}"
              </p>

              {/* User */}

              <div className="mt-8 flex items-center gap-4">

                <img
                  src={item.image}
                  alt={item.name}
                  className="
                  w-14
                  h-14
                  rounded-full
                  border-2
                  border-violet-500
                  "
                />

                <div>

                  <h4 className="text-white font-semibold">

                    {item.name}

                  </h4>

                  <p className="text-slate-400 text-sm">

                    {item.role}

                  </p>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}