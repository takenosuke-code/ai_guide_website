// lib/heroBg.ts

import fs from "fs";
import path from "path";

/**
 * Detects available hero background image in /public directory
 * Checks in priority order: hero-bg.png → hero-bg.jpg → hero-bg.webp
 * Returns the path if found, null otherwise
 */
export function getHeroBgPath(): string | null {
  const publicDir = path.join(process.cwd(), "public");
  const candidates = ["hero-bg.png", "hero-bg.jpg", "hero-bg.webp", "hero-bg.jpeg"];

  for (const file of candidates) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      return "/" + file;
    }
  }

  return null;
}

/**
 * Hero background image path (determined at build time)
 * Will be null if no matching image file exists
 */
export const HERO_BG_PATH = getHeroBgPath();

