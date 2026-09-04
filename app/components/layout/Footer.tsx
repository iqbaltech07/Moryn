"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#fcfbf8] border-t border-[#141817]/8 pt-16 pb-12 px-6 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#141817]/6">
          
          {/* Left Column: Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" id="footer-logo" className="inline-block">
              <Image
                src="/logo/Moryn-Light-Mode.webp"
                alt="Moryn"
                width={800}
                height={200}
                className="h-8 md:h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-[#737b78] max-w-sm leading-relaxed">
              Moryn is an AI PRD Generator &amp; System Architecture Tracking Platform for high-velocity engineering teams.
            </p>
          </div>

          {/* Right Columns: Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Products Column */}
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#141817] mb-4">
                Products
              </div>
              <ul className="space-y-2.5 list-none p-0 m-0">
                <li>
                  <Link href="/#features" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/#showcase" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Showcase
                  </Link>
                </li>
                <li>
                  <Link href="/generate" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    PRD Generator
                  </Link>
                </li>
                <li>
                  <Link href="/components" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Components
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#141817] mb-4">
                Resources
              </div>
              <ul className="space-y-2.5 list-none p-0 m-0">
                <li>
                  <Link href="/#how-it-works" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/#integrations" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Changelog
                  </Link>
                </li>
                <li>
                  <Link href="/#leaderboard" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#141817] mb-4">
                Company
              </div>
              <ul className="space-y-2.5 list-none p-0 m-0">
                <li>
                  <Link href="/#pricing" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-[#57575c] hover:text-[#141817] transition">
                    Sign in
                  </Link>
                </li>
                <li>
                  <span className="text-sm text-[#9ca3a0]">Privacy Policy</span>
                </li>
                <li>
                  <span className="text-sm text-[#9ca3a0]">Terms of Service</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#85858a]">
          <div>
            &copy; {new Date().getFullYear()} Moryn. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Built with precision for autonomous AI agents</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
