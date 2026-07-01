import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Is NutriMind AI completely free?",
    answer:
      "Yes. NutriMind AI offers a free version that lets you track meals, monitor nutrition, chat with the AI assistant, and access your health dashboard.",
  },
  {
    question: "Can NutriMind AI suggest healthy recipes?",
    answer:
      "Absolutely. Just tell the AI what ingredients you have, and it generates personalized recipes with calories and nutrition information.",
  },
  {
    question: "Does NutriMind AI support Indian food?",
    answer:
      "Yes. NutriMind AI understands Indian meals such as roti, dal, rice, idli, dosa, poha, paneer, and many more common dishes.",
  },
  {
    question: "Can I use it for weight loss or muscle gain?",
    answer:
      "Yes. NutriMind AI creates personalized nutrition recommendations for weight loss, muscle gain, maintenance, and overall healthy living.",
  },
  {
    question: "Is my health data secure?",
    answer:
      "Your health information is securely stored and protected using modern authentication and encryption practices. Privacy is a top priority.",
  },
  {
    question: "Does it provide workout plans?",
    answer:
      "Yes. Based on your profile, NutriMind AI can recommend beginner to advanced workout plans along with nutrition guidance.",
  },
];

function FAQItem({ faq, open, onClick }) {
  return (
    <motion.div
      layout
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-7 py-6 text-left"
      >
        <h3 className="text-white font-semibold text-lg">
          {faq.question}
        </h3>

        <motion.div
          animate={{
            rotate: open ? 180 : 0,
          }}
        >
          <ChevronDown className="text-violet-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
          >
            <p className="px-7 pb-7 text-slate-400 leading-8">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [active, setActive] = useState(0);

  return (
    <section
      id="faq"
      className="relative py-28 px-6"
    >
      <div className="max-w-4xl mx-auto">

        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-cyan-300 text-sm">

            Frequently Asked Questions

          </span>

          <h2 className="mt-6 text-4xl md:text-6xl font-black text-white">

            Everything You Need
            <br />
            To Know

          </h2>

          <p className="mt-6 text-slate-400 text-lg">

            Here are some of the most common questions
            about NutriMind AI.

          </p>

        </motion.div>

        {/* FAQ List */}

        <div className="mt-16 space-y-5">

          {faqs.map((faq, index) => (

            <FAQItem
              key={faq.question}
              faq={faq}
              open={active === index}
              onClick={() =>
                setActive(
                  active === index ? -1 : index
                )
              }
            />

          ))}

        </div>

      </div>
    </section>
  );
}