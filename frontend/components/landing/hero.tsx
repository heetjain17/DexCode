"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeEditorMockup from "./code-editor-mockup";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" as const },
  },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle radial background highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, oklch(0.577 0.245 27.325 / 0.07) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-32 xl:py-36">
        {/* Left: copy */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-dex-accent/25 bg-dex-accent/8 px-4 py-1.5 text-sm font-medium text-dex-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dex-accent" />
              Competitive Programming Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl leading-[1.1] font-bold tracking-tight text-dex-text lg:text-6xl xl:text-7xl"
          >
            Master
            <br />
            Competitive
            <br />
            <span className="text-dex-accent">Programming.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="max-w-md text-lg leading-relaxed text-dex-text-secondary"
          >
            Write code in your browser. Get instant feedback. Track progress. Compete globally.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <Link href="/register">
              <motion.div
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                className="inline-flex"
              >
                <Button className="h-12 gap-2 rounded-xl bg-dex-accent px-7 text-base font-semibold text-white shadow-none hover:bg-dex-accent-hover">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/problems">
              <motion.div whileTap={{ scale: 0.96 }} className="inline-flex">
                <Button
                  variant="outline"
                  className="h-12 gap-2 rounded-xl border-dex-border bg-transparent px-7 text-base text-dex-text hover:border-dex-text/30 hover:bg-dex-surface"
                >
                  Explore Problems
                  <ChevronRight className="h-4 w-4 text-dex-muted" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p variants={itemVariants} className="text-sm text-dex-muted">
            Used by <span className="font-medium text-dex-text-secondary">2,000+ developers</span>{" "}
            preparing for top-company interviews.
          </motion.p>
        </motion.div>

        {/* Right: editor mockup */}
        <div className="relative flex items-center justify-center lg:justify-end">
          {/* Glow behind the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, oklch(0.577 0.245 27.325 / 0.12) 0%, transparent 70%)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: 40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            style={{ perspective: 1000 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <CodeEditorMockup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
