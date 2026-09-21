import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: {
    allowedHosts: [
      "moryn.vercel.app",
      "piardify.vercel.app",
      "*.vercel.app",
      "localhost:3000",
    ],
    protocol: "auto",
  },
  trustedOrigins: [
    "https://localhost:3000",
    "http://localhost:3000",
    "https://*.vercel.app",
    process.env.BETTER_AUTH_URL || "",
  ].filter(Boolean),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
});
