"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      {/* Radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.577 0.245 27.325 / 0.09) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center"
      >
        <h2 className="text-4xl font-bold tracking-tight text-dex-text md:text-5xl">
          Start Solving Today.
        </h2>
        <p className="text-lg text-dex-text-secondary">No credit card required.</p>
        <Link href="/register">
          <motion.div
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className="inline-flex"
          >
            <Button className="h-12 gap-2 rounded-xl bg-dex-accent px-8 text-base font-semibold text-white shadow-none hover:bg-dex-accent-hover">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </Link>
      </motion.div>
    </section>
  );
}
