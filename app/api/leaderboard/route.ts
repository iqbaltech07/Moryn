import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getRank } from '@/lib/analytics/gamification';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      orderBy: { exp: 'desc' },
      take: 8,
      select: {
        id: true,
        name: true,
        exp: true,
        image: true,
        _count: {
          select: {
            projects: {
              where: { status: 'FINISHED' }
            }
          }
        }
      }
    });

    const formattedData = topUsers.map((user) => {
      const rank = getRank(user.exp);
      
      let avatarInitial = "U";
      if (user.name) {
        const names = user.name.split(" ");
        if (names.length >= 2) {
          avatarInitial = `${names[0][0]}${names[1][0]}`.toUpperCase();
        } else {
          avatarInitial = names[0].substring(0, 2).toUpperCase();
        }
      }
      
      return {
        id: user.id,
        name: user.name || "Anonymous User",
        points: user.exp,
        prds: user._count?.projects || 0,
        avatar: user.image || avatarInitial,
        rankName: rank.name,
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
