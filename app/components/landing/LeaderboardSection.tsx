"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, FileText, Zap, Award, Star, User } from "lucide-react";
import { apiClient } from "@/lib/utils/apiClient";

const DUMMY_DATA = [
  { id: "d1", name: "Alex Rivera",       rankName: "Chief Architect",    points: 15200, prds: 142, avatar: "AR" },
  { id: "d2", name: "Sarah Jenkins",     rankName: "Master Architect",   points: 12850, prds: 118, avatar: "SJ" },
  { id: "d3", name: "David Chen",        rankName: "Senior Visionary",   points: 10214, prds: 94,  avatar: "DC" },
  { id: "d4", name: "Emily Carter",      rankName: "Visionary",          points: 9198,  prds: 86,  avatar: "EC" },
  { id: "d5", name: "James Harrison",    rankName: "Rising Star",        points: 8156,  prds: 72,  avatar: "JH" },
  { id: "d6", name: "Rachel Patel",      rankName: "Product Maker",      points: 7134,  prds: 65,  avatar: "RP" },
  { id: "d7", name: "Daniel Foster",     rankName: "Idea Sprout",        points: 6112,  prds: 54,  avatar: "DF" },
  { id: "d8", name: "Olivia Bennett",    rankName: "Idea Sprout",        points: 5095,  prds: 42,  avatar: "OB" },
];

interface LeaderboardUser {
  id: string;
  name: string;
  rankName: string;
  points: number;
  prds: number;
  avatar: string;
  image?: string;
}

/**
 * Avatar with graceful fallback to Lucide User icon
 * if the image fails to load or is unavailable.
 */
function LeaderboardAvatar({
  image,
  avatar,
  name,
  iconSize = 22,
}: {
  image?: string;
  avatar?: string;
  name: string;
  iconSize?: number;
}) {
  const [hasError, setHasError] = useState(false);

  const isHttp = typeof avatar === "string" && (avatar.startsWith("http://") || avatar.startsWith("https://"));
  const imgSrc = image || (isHttp ? avatar : undefined);

  if (imgSrc && !hasError) {
    return (
      <img
        src={imgSrc}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    );
  }

  if (!hasError && avatar && typeof avatar === "string" && avatar.length <= 3 && !isHttp) {
    return <span className="font-bold">{avatar.toUpperCase()}</span>;
  }

  return <User size={iconSize} strokeWidth={2.2} className="opacity-80 shrink-0" />;
}

export default function LeaderboardSection() {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const json = await apiClient.leaderboard.get();
        let realData: LeaderboardUser[] = [];
        if (json.success && Array.isArray(json.data)) realData = json.data as LeaderboardUser[];

        const padded: LeaderboardUser[] = [...realData];
        let di = 0;
        while (padded.length < 8 && di < DUMMY_DATA.length) {
          padded.push(DUMMY_DATA[di++]);
        }
        padded.sort((a, b) => b.points - a.points);
        setData(padded.slice(0, 8));
      } catch {
        setData(DUMMY_DATA.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const top1 = data[0] || DUMMY_DATA[0];
  const top2 = data[1] || DUMMY_DATA[1];
  const top3 = data[2] || DUMMY_DATA[2];
  const restUsers = data.slice(3);

  return (
    <section id="leaderboard" className="py-24 px-4 md:px-8 bg-[#fcfbf8] relative">
      <div className="max-w-[1040px] mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-[720px] mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f2ea] border border-[#141817]/6 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e85d3f] mb-4">
            Leaderboard
          </div>
          <h2 className="font-serif text-[34px] sm:text-[44px] md:text-[50px] font-bold text-[#141817] tracking-[-0.025em] leading-[1.12] mb-4">
            Top Product Thinkers
          </h2>
          <p className="text-base sm:text-lg text-[#57575c] leading-relaxed">
            Celebrating creators turning ambitious concepts into structured PRDs with Moryn.
          </p>
        </div>

        {/* ── Podium Top 3 ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
          
          {/* #2 Rank (Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-2 md:order-1 bg-white p-6 rounded-[24px] border border-[#141817]/8 shadow-sm flex flex-col items-center text-center relative hover:shadow-md transition"
          >
            {/* Rank 2 Badge */}
            <div className="w-8 h-8 rounded-full bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] flex items-center justify-center font-bold text-sm font-mono mb-4 shadow-xs">
              2
            </div>
            
            {/* Avatar with fallback */}
            <div className="w-16 h-16 rounded-full bg-[#f8fafc] border-2 border-[#cbd5e1] flex items-center justify-center text-lg text-[#475569] mb-3 overflow-hidden shadow-xs">
              <LeaderboardAvatar
                image={top2.image}
                avatar={top2.avatar}
                name={top2.name}
                iconSize={24}
              />
            </div>

            <h4 className="text-base font-bold text-[#141817] mb-1">{top2.name}</h4>
            <div className="flex items-center gap-1 text-xs text-[#737b78] mb-4">
              <Award size={13} className="text-[#94a3b8]" />
              <span>{top2.rankName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-[#141817]/6">
              <div>
                <div className="text-sm font-bold font-mono text-[#141817]">{top2.prds}</div>
                <div className="text-[10px] uppercase font-mono text-[#85858a]">PRDs</div>
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-[#141817]">
                  {top2.points.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase font-mono text-[#85858a]">Points</div>
              </div>
            </div>
          </motion.div>

          {/* #1 Rank (Center - Prominent Dark Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-1 md:order-2 bg-[#141817] text-white p-8 rounded-[28px] shadow-[0_20px_45px_rgba(20,24,23,0.18)] flex flex-col items-center text-center relative md:-translate-y-4 hover:-translate-y-5 transition-transform duration-200"
          >
            {/* Rank 1 Crown Badge */}
            <div className="w-9 h-9 rounded-full bg-[#e85d3f] text-white flex items-center justify-center font-bold text-sm font-mono mb-4 shadow-[0_4px_12px_rgba(232,93,63,0.4)]">
              1
            </div>

            {/* Avatar with fallback */}
            <div className="w-20 h-20 rounded-full bg-[#202524] border-2 border-[#e85d3f] flex items-center justify-center text-xl text-white mb-3.5 overflow-hidden shadow-md">
              <LeaderboardAvatar
                image={top1.image}
                avatar={top1.avatar}
                name={top1.name}
                iconSize={30}
              />
            </div>

            <h4 className="text-lg font-bold text-white mb-1 tracking-tight">{top1.name}</h4>
            <div className="flex items-center gap-1.5 text-xs text-[#e85d3f] font-medium mb-5">
              <Trophy size={14} />
              <span>{top1.rankName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/10">
              <div>
                <div className="text-base font-bold font-mono text-white">{top1.prds}</div>
                <div className="text-[10px] uppercase font-mono text-[#a1a1aa]">PRDs</div>
              </div>
              <div>
                <div className="text-base font-bold font-mono text-[#e85d3f]">
                  {top1.points.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase font-mono text-[#a1a1aa]">Points</div>
              </div>
            </div>
          </motion.div>

          {/* #3 Rank (Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="order-3 bg-white p-6 rounded-[24px] border border-[#141817]/8 shadow-sm flex flex-col items-center text-center relative hover:shadow-md transition"
          >
            {/* Rank 3 Badge */}
            <div className="w-8 h-8 rounded-full bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] flex items-center justify-center font-bold text-sm font-mono mb-4 shadow-xs">
              3
            </div>

            {/* Avatar with fallback */}
            <div className="w-16 h-16 rounded-full bg-[#fffaf5] border-2 border-[#fed7aa] flex items-center justify-center text-lg text-[#9a3412] mb-3 overflow-hidden shadow-xs">
              <LeaderboardAvatar
                image={top3.image}
                avatar={top3.avatar}
                name={top3.name}
                iconSize={24}
              />
            </div>

            <h4 className="text-base font-bold text-[#141817] mb-1">{top3.name}</h4>
            <div className="flex items-center gap-1 text-xs text-[#737b78] mb-4">
              <Star size={13} className="text-[#f59e0b]" />
              <span>{top3.rankName}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full pt-3 border-t border-[#141817]/6">
              <div>
                <div className="text-sm font-bold font-mono text-[#141817]">{top3.prds}</div>
                <div className="text-[10px] uppercase font-mono text-[#85858a]">PRDs</div>
              </div>
              <div>
                <div className="text-sm font-bold font-mono text-[#141817]">
                  {top3.points.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase font-mono text-[#85858a]">Points</div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Ranks 4 to 8 List Rows ── */}
        <div className="space-y-3 max-w-[800px] mx-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/70 rounded-2xl border border-[#141817]/6 animate-pulse" />
            ))
          ) : (
            restUsers.map((user, idx) => {
              const rank = idx + 4;
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-[#141817]/8 shadow-xs hover:shadow-sm hover:border-[#141817]/15 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 text-center font-mono font-bold text-sm text-[#737b78]">
                      {rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#f5f2ea] border border-[#141817]/10 flex items-center justify-center text-xs text-[#141817] overflow-hidden">
                      <LeaderboardAvatar
                        image={user.image}
                        avatar={user.avatar}
                        name={user.name}
                        iconSize={18}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#141817]">{user.name}</div>
                      <div className="text-[11px] text-[#737b78]">{user.rankName}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 sm:gap-8">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-mono font-bold text-[#141817]">
                        {user.prds}
                      </div>
                      <div className="text-[10px] font-mono text-[#85858a]">PRDs</div>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <div className="text-xs sm:text-sm font-mono font-bold text-[#e85d3f]">
                        {user.points.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-[#85858a]">Points</div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
