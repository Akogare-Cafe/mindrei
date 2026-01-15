"use client";

import { motion } from "framer-motion";

export function MindMapSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-transparent rounded-2xl border border-border/50">
      <div className="relative w-full h-full max-w-4xl max-h-[600px] flex items-center justify-center">
        <motion.div
          className="absolute"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-32 h-32 rounded-full border-4 border-primary/20 bg-primary/5 flex items-center justify-center">
            <motion.div
              className="w-24 h-24 rounded-full border-4 border-primary/30 bg-primary/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>

        {[...Array(6)].map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const radius = 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
            >
              <motion.div
                className="w-20 h-20 rounded-full border-2 border-primary/20 bg-muted/50 -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3], scale: 1 }}
                transition={{
                  opacity: {
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  },
                  scale: {
                    duration: 0.5,
                    delay: i * 0.1,
                  },
                }}
              />
            </div>
          );
        })}

        <motion.div
          className="absolute bottom-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm font-medium text-muted-foreground">
            Loading mind map...
          </p>
          <motion.div
            className="flex gap-1 justify-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
