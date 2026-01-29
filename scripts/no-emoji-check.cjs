#!/usr/bin/env node

/**
 * No-Emoji Check
 *
 * Fails if any of the provided text files contain emoji / pictographic symbols.
 * Intended for use with lint-staged / Husky.
 */

const fs = require("fs");
const path = require("path");

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

// Some symbols can match Extended_Pictographic in certain runtimes.
// We explicitly allow these in documentation.
const ALLOWED_CHARS = new Set(["©", "®", "™"]);

const DEFAULT_TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".cjs",
  ".mjs",
  ".json",
  ".yml",
  ".yaml",
  ".md",
  ".sh",
  ".css",
  ".html",
  ".xml",
]);

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return DEFAULT_TEXT_EXTENSIONS.has(ext);
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return null;
  }
}

function indexToLineCol(text, index) {
  const before = text.slice(0, index);
  const line = before.split(/\r?\n/).length;
  const col = before.length - before.lastIndexOf("\n");
  return { line, col };
}

function findFirstDisallowedPictograph(text) {
  // Scan *all* matches, ignore allowlisted symbols.
  const re = /\p{Extended_Pictographic}/gu;
  let match;
  while ((match = re.exec(text))) {
    const char = match[0];
    if (ALLOWED_CHARS.has(char)) continue;

    const { line, col } = indexToLineCol(text, match.index);
    return { index: match.index, line, col, char };
  }
  return null;
}

function main() {
  const args = process.argv.slice(2).filter(Boolean);

  if (args.length === 0) {
    console.log("no-emoji-check: no files provided");
    process.exit(0);
  }

  const files = args.filter(
    (f) => typeof f === "string" && f.trim().length > 0
  );

  let failed = false;

  for (const file of files) {
    if (!isTextFile(file)) continue;
    if (!fs.existsSync(file)) continue;

    const content = readFileSafe(file);
    if (content == null) continue;

    const loc = findFirstDisallowedPictograph(content);
    if (loc) {
      const where = `:${loc.line}:${loc.col}`;
      console.error(`no-emoji-check: emoji detected in ${file}${where}`);
      failed = true;
    }
  }

  if (failed) {
    console.error(
      "\nPlease replace emoji with professional icons (SVG/Lucide) or plain text."
    );
    process.exit(1);
  }

  process.exit(0);
}

main();
