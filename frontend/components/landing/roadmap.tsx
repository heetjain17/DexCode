"use client";

import { motion } from "motion/react";
import { CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoadmapItem {
  text: string;
  done: boolean;
}

interface RoadmapColumn {
  phase: string;
  badge: {
    label: string;
    className: string;
  };
  items: RoadmapItem[];
}

const ROADMAP: RoadmapColumn[] = [
  {
    phase: "Now",
    badge: {
      label: "Live",
      className: "border-green-500/40 bg-green-500/10 text-green-400",
    },
    items: [
      { text: "Core problem solving environment", done: true },
      { text: "Real-time code judging (Judge0)", done: true },
      { text: "Multi-language support (C++, Python, Java, JS)", done: true },
      { text: "Problem discussions", done: true },
      { text: "User authentication (OAuth)", done: true },
    ],
  },
  {
    phase: "Next",
    badge: {
      label: "In Progress",
      className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    },
    items: [
      { text: "Submission analytics dashboard", done: false },
      { text: "Advanced problem filtering", done: false },
      { text: "User profiles & badges", done: false },
      { text: "Company-specific problem tags", done: false },
      { text: "Difficulty rating system", done: false },
    ],
  },
  {
    phase: "Coming Soon",
    badge: {
      label: "Planned",
      className: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    },
    items: [
      { text: "Curated problem playlists", done: false },
      { text: "Live contests & rankings", done: false },
      { text: "Company interview tracks", done: false },
      { text: "AI-powered hints", done: false },
      { text: "Team competitions", done: false },
    ],
  },
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-24 lg:py-32">
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
            Product Roadmap
          </h2>
          <p className="text-dex-text-secondary">
            Where we are, where we&apos;re going, and what&apos;s coming next.
          </p>
        </motion.div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {ROADMAP.map((column, colIndex) => (
            <motion.div
              key={column.phase}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: colIndex * 0.1, ease: "easeOut" }}
              className="rounded-2xl border border-dex-border bg-dex-surface p-6"
            >
              {/* Column header */}
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-dex-text">{column.phase}</h3>
                <Badge
                  variant="outline"
                  className={cn("text-xs font-medium", column.badge.className)}
                >
                  {column.badge.label}
                </Badge>
              </div>

              {/* Items */}
              <ul className="space-y-3">
                {column.items.map((item) => (
                  <li key={item.text} className="flex gap-3 text-sm">
                    {item.done ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-dex-muted" />
                    )}
                    <span className={item.done ? "text-dex-text" : "text-dex-text-secondary"}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
