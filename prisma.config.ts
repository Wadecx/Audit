import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import path from "path";

// Charge .env.local en priorité (comme Next.js), puis .env en fallback
config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
