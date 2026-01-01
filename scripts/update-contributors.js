#!/usr/bin/env node
/**
 * Auto-update README sections: Repository Statistics and Top Contributors.
 * - Fetches data from GitHub REST API
 * - Replaces only the target HTML blocks while preserving styles
 * - Commits only when there are changes
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO = process.env.GITHUB_REPOSITORY || "Xenonesis/code-guardian-report";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const ROOT = process.cwd();
const README_PATH = path.join(ROOT, "README.md");

// Config
const MAX_TOP_CONTRIBUTORS = parseInt(
  process.env.MAX_TOP_CONTRIBUTORS || "8",
  10
);
const REQUEST_TIMEOUT_MS = 15000;

function ghApi(pathname) {
  const headers = {
    "User-Agent": "readme-updater",
    Accept: "application/vnd.github+json",
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.github.com",
        path: pathname,
        method: "GET",
        headers,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (_) {
              resolve({});
            }
          } else {
            reject(
              new Error(
                `GitHub API ${pathname} failed: ${res.statusCode} ${data}`
              )
            );
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("Request timeout"));
    });
    req.end();
  });
}

async function fetchRepoStats() {
  const [owner, repo] = REPO.split("/");
  const repoData = await ghApi(`/repos/${owner}/${repo}`);
  const contribs = await ghApi(
    `/repos/${owner}/${repo}/contributors?per_page=100`
  );

  const stars = repoData.stargazers_count || 0;
  const forks = repoData.forks_count || 0;
  const watchers = repoData.subscribers_count || repoData.watchers_count || 0;
  const contributors = Array.isArray(contribs) ? contribs : [];

  const topContributors = contributors
    .filter((c) => !!c && typeof c.contributions === "number")
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, MAX_TOP_CONTRIBUTORS)
    .map((c) => ({
      login: c.login,
      contributions: c.contributions,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
    }));

  return {
    stars,
    forks,
    watchers,
    contributorsCount: contributors.length,
    topContributors,
  };
}

function replaceBetween(content, startMarker, endMarker, newBlock) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker, startIdx + startMarker.length);
  if (startIdx === -1 || endIdx === -1) return content; // not found
  return (
    content.slice(0, startIdx + startMarker.length) +
    newBlock +
    content.slice(endIdx)
  );
}

function renderRepositoryStatsHTML(stats) {
  // Preserve the surrounding gradient container by only replacing the inner <table> ... </table>
  const table = `
  <table style="margin: 0 auto;">
    <tr>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">⭐ ${stats.stars}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Stars</p>
        </div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">🍴 ${stats.forks}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Forks</p>
        </div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">👥 ${stats.contributorsCount}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Contributors</p>
        </div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">👀 ${stats.watchers}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Watchers</p>
        </div>
      </td>
    </tr>
  </table>`;
  return table;
}

function renderTopContributorsTable(top) {
  // Renders the block of <tr>...</tr> tables with 4 items per row similar to current layout
  const chunk = (arr, size) =>
    arr.reduce(
      (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
      []
    );
  const rows = chunk(top, 4)
    .map((group) => {
      const tds = group
        .map(
          (c) => `
      <td align="center" style="padding: 20px;">
        <img src="${c.avatar_url}" width="100" height="100" style="border-radius: 50%; border: 4px solid white; box-shadow: 0 6px 16px rgba(0,0,0,0.4);"/>
        <br/><strong style="color: white; font-size: 16px;">${c.login}</strong>
        <br/><span style="color: rgba(255,255,255,0.9); font-size: 14px;">@${c.login}</span>
        <br/><span style="background: rgba(255,255,255,0.3); padding: 4px 12px; border-radius: 15px; font-size: 12px; color: white; margin-top: 8px; display: inline-block;">👤 Contributor</span>
        <br/><span style="color: rgba(255,255,255,0.8); font-size: 12px; margin-top: 5px; display: block;">Contributor</span>
        <div style="margin-top: 10px;">
          <span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 8px; font-size: 10px; color: white; margin: 2px;">${c.contributions} commits</span>
        </div>
      </td>
    `
        )
        .join("\n");
      return `<tr>\n${tds}\n    </tr>`;
    })
    .join("\n");
  return rows;
}

function safeReplaceRepositoryStats(readme, stats) {
  const start =
    '<h3 style="color: white; margin-bottom: 20px;">📊 **Repository Statistics** 📊</h3>';
  // We replace the immediate following <table>...</table> block within the stats container
  const tableStart = '<table style="margin: 0 auto;">';
  const tableEnd = "</table>";

  const startIdx = readme.indexOf(start);
  if (startIdx === -1) return readme;
  const tableIdx = readme.indexOf(tableStart, startIdx);
  if (tableIdx === -1) return readme;
  const endIdx = readme.indexOf(tableEnd, tableIdx);
  if (endIdx === -1) return readme;

  const before = readme.slice(0, tableIdx);
  const after = readme.slice(endIdx + tableEnd.length);
  const replacement = renderRepositoryStatsHTML(stats);
  return before + replacement + after;
}

function safeReplaceTopContributors(readme, top) {
  const header = "💻 **Top Contributors** 💻";
  const headerAlt = "💻 **Top Contributors** 💻</h3>"; // in case of exact h3 markup
  const sectionStartIdx = readme.indexOf(header);
  const sectionIdx =
    sectionStartIdx !== -1 ? sectionStartIdx : readme.indexOf(headerAlt);
  if (sectionIdx === -1) return readme;

  // Locate the gradient container table area following the header; replace rows inside first <table> ... </table>
  const tableStart = '<table style="margin: 0 auto;">';
  const tableEnd = "</table>";
  const tStartIdx = readme.indexOf(tableStart, sectionIdx);
  if (tStartIdx === -1) return readme;
  const tEndIdx = readme.indexOf(tableEnd, tStartIdx);
  if (tEndIdx === -1) return readme;

  // Inside this table, replace content between the first <tr> ... last </tr> with freshly rendered rows
  const firstTr = readme.indexOf("<tr>", tStartIdx);
  const lastTrEnd = readme.lastIndexOf("</tr>", tEndIdx);
  if (firstTr === -1 || lastTrEnd === -1) return readme;

  const before = readme.slice(0, firstTr);
  const after = readme.slice(lastTrEnd + "</tr>".length);
  const rows = renderTopContributorsTable(top);
  return before + rows + after;
}

async function main() {
  if (!fs.existsSync(README_PATH)) {
    console.error("README.md not found at", README_PATH);
    process.exit(0);
  }
  let readme = fs.readFileSync(README_PATH, "utf8");

  try {
    const stats = await fetchRepoStats();
    const updatedStats = safeReplaceRepositoryStats(readme, stats);
    const updatedContribs = safeReplaceTopContributors(
      updatedStats,
      stats.topContributors
    );

    if (updatedContribs !== readme) {
      fs.writeFileSync(README_PATH, updatedContribs, "utf8");
      console.log("README.md updated.");
    } else {
      console.log("No changes detected.");
    }
  } catch (err) {
    console.error("Failed to update README:", err.message);
    process.exit(0); // do not fail CI for transient issues
  }
}

main();
