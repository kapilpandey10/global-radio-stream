import { motion } from "framer-motion";

export const SadFaceAnimation = () => (
  <div className="flex flex-col items-center gap-4 py-6">
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Face circle */}
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="3"
        fill="none"
        strokeOpacity={0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Left eye */}
      <motion.line
        x1="26"
        y1="28"
        x2="32"
        y2="34"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
      <motion.line
        x1="32"
        y1="28"
        x2="26"
        y2="34"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />

      {/* Right eye */}
      <motion.line
        x1="48"
        y1="28"
        x2="54"
        y2="34"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      />
      <motion.line
        x1="54"
        y1="28"
        x2="48"
        y2="34"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      />

      {/* Sad mouth */}
      <motion.path
        d="M28 52 Q40 44 52 52"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />

      {/* Animated tear drop */}
      <motion.circle
        cx="30"
        cy="38"
        r="2"
        fill="hsl(var(--primary))"
        fillOpacity={0.4}
        initial={{ cy: 36, opacity: 0 }}
        animate={{ cy: [36, 50, 50], opacity: [0, 0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeIn" }}
      />
    </motion.svg>

    <motion.div
      className="text-center space-y-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <p className="text-sm font-semibold text-muted-foreground">
        Station appears to be offline
      </p>
      <p className="text-xs text-muted-foreground/60">
        Try another station or check back later
      </p>
    </motion.div>
  </div>
);
