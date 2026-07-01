import { motion } from "framer-motion";

const blobs = [
  {
    size: "w-[500px] h-[500px]",
    color: "from-violet-600/40 to-fuchsia-500/10",
    position: "-top-32 -left-32",
    duration: 16,
    delay: 0,
  },
  {
    size: "w-[450px] h-[450px]",
    color: "from-cyan-500/35 to-blue-500/10",
    position: "top-1/3 -right-24",
    duration: 18,
    delay: 1,
  },
  {
    size: "w-[420px] h-[420px]",
    color: "from-emerald-500/30 to-green-400/5",
    position: "bottom-0 left-1/4",
    duration: 20,
    delay: 2,
  },
  {
    size: "w-[380px] h-[380px]",
    color: "from-pink-500/25 to-rose-500/10",
    position: "bottom-20 right-1/4",
    duration: 22,
    delay: 3,
  },
];

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Base Background */}

      <div className="absolute inset-0 bg-[#050816]" />

      {/* Grid */}

      <div
        className="
          absolute
          inset-0
          opacity-[0.06]
          [background-image:linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)]
          [background-size:80px_80px]
        "
      />

      {/* Animated Blobs */}

      {blobs.map((blob, index) => (
        <motion.div
          key={index}
          initial={{
            x: 0,
            y: 0,
            scale: 1,
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -40, 30, 0],
            scale: [1, 1.15, 0.95, 1],
            rotate: [0, 10, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            ease: "easeInOut",
            duration: blob.duration,
            delay: blob.delay,
          }}
          className={`
            absolute
            ${blob.position}
            ${blob.size}
            rounded-full
            blur-[120px]
            bg-gradient-to-br
            ${blob.color}
          `}
        />
      ))}

      {/* Large Center Glow */}

      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.45, 0.7, 0.45],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[700px]
          h-[700px]
          rounded-full
          blur-[160px]
          bg-gradient-to-r
          from-violet-600/20
          via-cyan-500/15
          to-emerald-500/20
        "
      />

      {/* Top Gradient */}

      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-64
          bg-gradient-to-b
          from-violet-500/10
          to-transparent
        "
      />

      {/* Bottom Gradient */}

      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-80
          bg-gradient-to-t
          from-[#050816]
          via-[#050816]/80
          to-transparent
        "
      />

      {/* Radial Overlay */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,#050816_100%)]
        "
      />
    </div>
  );
}