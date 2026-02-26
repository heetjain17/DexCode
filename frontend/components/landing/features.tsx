"use client";

import { motion } from "motion/react";
import {
  Zap,
  Trophy,
  Code2,
  BarChart3,
  MessageSquare,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gridArea: string;
  accent?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: "Real-Time Code Execution",
    description:
      "Run your solutions instantly against example test cases directly in your browser. Sub-second sandboxed execution with detailed output and error traces.",
    gridArea: "a",
    accent: true,
  },
  {
    icon: Trophy,
    title: "Judge0-Powered Grading",
    description:
      "Submit and get graded against hidden test cases. Get an ACCEPTED badge or pinpoint exactly which test failed.",
    gridArea: "b",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual heatmaps, topic mastery charts, and rating history. Know exactly where you stand.",
    gridArea: "c",
  },
  {
    icon: MessageSquare,
    title: "Discussions & Community",
    description:
      "Learn from editorial explanations and community approaches after each problem. Vote, comment, and grow.",
    gridArea: "d",
    accent: true,
  },
  {
    icon: Code2,
    title: "Multi-Language Support",
    description:
      "Write in Python, Java, JavaScript, C++, Go, Rust, and 20+ more languages. Same experience, every language.",
    gridArea: "e",
    accent: true,
  },
  {
    icon: SlidersHorizontal,
    title: "Problem Ratings & Filters",
    description:
      "Filter by difficulty, topic, company, or rating. Build targeted practice sessions and never waste a session.",
    gridArea: "f",
  },
];

function FeatureCard({ feature, delay }: { feature: Feature; delay: number }) {
  return (
    <motion.div
      style={{ gridArea: feature.gridArea }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={cn(
        "group rounded-2xl border border-dex-border p-6 transition-all duration-300",
        "hover:border-dex-accent/30 hover:shadow-xl hover:shadow-black/20",
        feature.accent
          ? "bg-gradient-to-br from-dex-surface to-dex-surface-elevated"
          : "bg-dex-surface"
      )}
    >
      <div className="mb-4 inline-flex rounded-xl border border-dex-accent/20 bg-dex-accent/10 p-2.5">
        <feature.icon className="h-5 w-5 text-dex-accent" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-dex-text">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-dex-text-secondary">{feature.description}</p>
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-dex-text md:text-4xl">
            Everything You Need to Level Up
          </h2>
          <p className="mx-auto max-w-xl text-dex-text-secondary">
            A complete competitive programming workflow — from problem practice to global
            competition.
          </p>
        </motion.div>

        {/* Bento grid – desktop */}
        <div
          className="hidden gap-4 lg:grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateAreas: `
              "a a b"
              "c d d"
              "e e f"
            `,
          }}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.gridArea} feature={feature} delay={i * 0.05} />
          ))}
        </div>

        {/* Simple grid – mobile / tablet */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={`mobile-${feature.gridArea}`} feature={feature} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </section>
  );
}
