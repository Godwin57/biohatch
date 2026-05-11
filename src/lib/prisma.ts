import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const getPrisma = () => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "CRITICAL VERCEL ERROR: DATABASE_URL is missing during live request.",
    );
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaNeon(pool as any);

  globalForPrisma.prisma = new PrismaClient({ adapter });
  return globalForPrisma.prisma;
};
