"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  name: string;
  role: string;
  company: string;
  text: string;
  initials: string;
  avatarClass: string;
}

const REVIEWS: Review[] = [
  {
    name: "Alex Chen",
    role: "Software Engineer",
    company: "Google",
    text: "DexCode feels like a serious alternative to LeetCode. Clean UI, instant feedback, and no distractions. I used it for 2 months before my Google interview and got the offer.",
    initials: "AC",
    avatarClass: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  },
  {
    name: "Sarah Kim",
    role: "Senior SWE",
    company: "Amazon",
    text: "The code execution speed is impressive. No lag, no hanging tabs, no copying to a local IDE. Everything I need is right there in the problem view.",
    initials: "SK",
    avatarClass: "border-orange-500/40 bg-orange-500/10 text-orange-400",
  },
  {
    name: "Marcus Johnson",
    role: "Backend Engineer",
    company: "Stripe",
    text: "I've been using DexCode to prep for system design and algorithmic interviews. The problem quality is excellent and the editorial explanations are the best I've seen.",
    initials: "MJ",
    avatarClass: "border-purple-500/40 bg-purple-500/10 text-purple-400",
  },
  {
    name: "Priya Sharma",
    role: "Software Engineer",
    company: "Microsoft",
    text: "As someone who prefers C++ for competitive programming, DexCode's multi-language support is a game changer. The judge is accurate and fast.",
    initials: "PS",
    avatarClass: "border-green-500/40 bg-green-500/10 text-green-400",
  },
  {
    name: "David Park",
    role: "Full Stack Engineer",
    company: "Meta",
    text: "The discussion threads after each problem are incredibly useful. Seeing multiple approaches to the same problem accelerated my learning more than any course.",
    initials: "DP",
    avatarClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  },
  {
    name: "Lena Müller",
    role: "Software Engineer",
    company: "Netflix",
    text: "I switched from LeetCode after a week. The interface is cleaner, the problems are well-organized, and the progress tracking helps me stay consistent.",
    initials: "LM",
    avatarClass: "border-red-500/40 bg-red-500/10 text-red-400",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="testimonials" className="py-24 lg:py-32">
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
            What Developers Are Saying
          </h2>
          <p className="text-dex-text-secondary">
            Engineers who used DexCode to land their dream roles.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="flex flex-col gap-4 rounded-2xl border border-dex-border bg-dex-surface p-6 transition-shadow duration-300 hover:border-dex-border/60 hover:shadow-xl hover:shadow-black/20"
            >
              <StarRating />
              <p className="flex-1 text-sm leading-relaxed text-dex-text-secondary">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    review.avatarClass
                  )}
                >
                  {review.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-dex-text">{review.name}</div>
                  <div className="text-xs text-dex-muted">
                    {review.role} &middot; {review.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
