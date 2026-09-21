"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CtaSection({ onSeeExample }: { onSeeExample?: () => void }) {
  return (
    <section className="py-24 px-4 md:px-8 bg-[#e85d3f] text-white relative overflow-hidden">
      {/* Subtle background decorative shapes */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-2xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-96 h-96 bg-black/10 rounded-full blur-2xl pointer-events-none"
      />

      <div className="max-w-[860px] mx-auto text-center relative z-10">
        
        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-[36px] sm:text-[48px] md:text-[56px] font-bold text-white tracking-[-0.03em] leading-[1.08] mb-5"
        >
          Ready to transform your ideas?
        </motion.h2>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-base sm:text-lg md:text-[18px] text-white/90 max-w-[620px] mx-auto leading-relaxed mb-9"
        >
          Join thousands of product managers and developers who are already building better software with Moryn. Start your free trial today.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
        >
          <Link
            href="/dashboard"
            id="bottom-cta-primary"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-[#fff9f7] active:bg-[#f5f2ea] text-[#e85d3f] text-[15px] font-bold shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
          >
            <span>Get started for free</span>
            <ArrowRight size={16} />
          </Link>

          {onSeeExample && (
            <button
              onClick={onSeeExample}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[14px] font-semibold backdrop-blur-xs transition"
            >
              <Sparkles size={15} />
              <span>Preview Example</span>
            </button>
          )}
        </motion.div>

      </div>
    </section>
  );
}
