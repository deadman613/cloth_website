import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Lazily build the client so importing this module (e.g. during Next.js
// build-time page data collection) doesn't fail when env vars aren't set yet.
function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      "Database connection is not configured. Set DATABASE_URL in the Vercel project environment variables.",
    );
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrisma() {
  const cachedPrisma = globalForPrisma.prisma;
  const hasCurrentSchema =
    cachedPrisma && typeof cachedPrisma.contactMessage?.findMany === "function";

  if (hasCurrentSchema) return cachedPrisma;

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// Proxy defers client creation until a property (e.g. prisma.user) is accessed.
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      return getPrisma()[prop];
    },
  },
);

// Default Export add kiya taaki "Cannot read properties of undefined" dubara na aaye
export default prisma;
