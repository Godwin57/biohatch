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

export const getPrisma = (connectionString: string) => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool as any);

  globalForPrisma.prisma = new PrismaClient({ adapter });
  return globalForPrisma.prisma;
};
