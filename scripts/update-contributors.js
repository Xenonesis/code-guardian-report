#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub API configuration
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'Xenonesis';
const REPO_NAME = 'code-guardian-report';

// Fetch contributors from GitHub API
async function fetchContributors() {
  try {
    console.log('Fetching contributors from GitHub API...');
    
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      console.log('Using GitHub token for API requests');
    }
    
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contributors?per_page=50`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const contributors = await response.json();
    
    // Filter out bots and get only real users
    const realContributors = contributors.filter(contributor => 
      contributor.type === 'User' && 
      contributor.contributions > 0 &&
      !contributor.login.includes('[bot]')
    );
    
    console.log(`Found ${realContributors.length} real contributors`);
    return realContributors;
  } catch (error) {
    console.error('Error fetching contributors:', error);
    return [];
  }
}

// Fetch detailed user information
async function fetchUserDetails(username) {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`, {
      headers
    });
    
    if (!response.ok) {
      console.warn(`Could not fetch details for ${username}: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Error fetching details for ${username}:`, error.message);
    return null;
  }
}

// Fetch repository stats
async function fetchRepoStats() {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    
    const response = await fetch(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const repo = await response.json();
    return {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      watchers: repo.watchers_count,
      openIssues: repo.open_issues_count
    };
  } catch (error) {
    console.error('Error fetching repository stats:', error);
    return { stars: 0, forks: 0, watchers: 0, openIssues: 0 };
  }
}

// Generate contributor role based on contributions
function getContributorRole(contributions, index) {
  if (index === 0) return 'Project Creator & Lead Developer';
  if (contributions > 100) return 'Core Contributor';
  if (contributions > 50) return 'Senior Contributor';
  if (contributions > 20) return 'Active Contributor';
  if (contributions > 10) return 'Regular Contributor';
  return 'Contributor';
}

// Generate contributor badge color
function getContributorBadge(contributions, index) {
  if (index === 0) return '🚀 Creator';
  if (contributions > 100) return '⭐ Core';
  if (contributions > 50) return '💎 Senior';
  if (contributions > 20) return '🔥 Active';
  if (contributions > 10) return '✨ Regular';
  return '👤 Contributor';
}

// Generate the new contributors section
function generateContributorsSection(contributors, repoStats) {
  const topContributors = contributors.slice(0, 8); // Show top 8 contributors
  
  let contributorsHtml = `
## 🌟 Community & Contributors

<div align="center">

### **👥 Our Amazing Community**

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 20px; margin: 20px 0;">
  <h3 style="color: white; margin-bottom: 20px;">📊 **Repository Statistics** 📊</h3>
  <p style="color: rgba(255,255,255,0.9); margin-bottom: 25px;">Thank you to our amazing community for making Code Guardian possible!</p>
  
  <table style="margin: 0 auto;">
    <tr>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">⭐ ${repoStats.stars}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Stars</p>
        </div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">🍴 ${repoStats.forks}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Forks</p>
        </div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">👥 ${contributors.length}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Contributors</p>
        </div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px;">
          <h4 style="color: white; margin: 0; font-size: 24px;">👀 ${repoStats.watchers}</h4>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Watchers</p>
        </div>
      </td>
    </tr>
  </table>
</div>

### **🤝 Core Contributors**

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 20px; margin: 20px 0;">
  <h3 style="color: white; margin-bottom: 20px;">💻 **Top Contributors** 💻</h3>
  <p style="color: rgba(255,255,255,0.9); margin-bottom: 25px; text-align: center;">Meet the amazing developers who have contributed to Code Guardian</p>
  
  <table style="margin: 0 auto;">`;

  // Generate rows for top contributors (4 per row)
  for (let i = 0; i < topContributors.length; i += 4) {
    contributorsHtml += '\n    <tr>';
    
    for (let j = i; j < Math.min(i + 4, topContributors.length); j++) {
      const contributor = topContributors[j];
      const role = getContributorRole(contributor.contributions, j);
      const badge = getContributorBadge(contributor.contributions, j);
      
      contributorsHtml += `
      <td align="center" style="padding: 20px;">
        <img src="${contributor.avatar_url}" width="100" height="100" style="border-radius: 50%; border: 4px solid white; box-shadow: 0 6px 16px rgba(0,0,0,0.4);"/>
        <br/><strong style="color: white; font-size: 16px;">${contributor.name || contributor.login}</strong>
        <br/><span style="color: rgba(255,255,255,0.9); font-size: 14px;">@${contributor.login}</span>
        <br/><span style="background: rgba(255,255,255,0.3); padding: 4px 12px; border-radius: 15px; font-size: 12px; color: white; margin-top: 8px; display: inline-block;">${badge}</span>
        <br/><span style="color: rgba(255,255,255,0.8); font-size: 12px; margin-top: 5px; display: block;">${role}</span>
        <div style="margin-top: 10px;">
          <span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 8px; font-size: 10px; color: white; margin: 2px;">${contributor.contributions} commits</span>
        </div>
      </td>`;
    }
    
    contributorsHtml += '\n    </tr>';
  }

  contributorsHtml += `
  </table>
</div>

### **🏅 All Contributors**

<div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 25px; border-radius: 20px; margin: 20px 0;">
  <h3 style="color: #333; margin-bottom: 20px;">🌟 **Thank You to All Contributors** 🌟</h3>
  
  <div style="text-align: center; margin-bottom: 20px;">
    <p style="color: #666; font-size: 16px;">We appreciate every contribution, no matter how big or small!</p>
  </div>
  
  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 20px 0;">`;

  // Add all contributors as small avatars
  contributors.forEach(contributor => {
    contributorsHtml += `
    <a href="${contributor.html_url}" target="_blank" style="text-decoration: none;">
      <img src="${contributor.avatar_url}" width="50" height="50" style="border-radius: 50%; border: 2px solid #333; margin: 2px;" title="${contributor.name || contributor.login} (${contributor.contributions} contributions)"/>
    </a>`;
  });

  contributorsHtml += `
  </div>
  
  <div style="margin-top: 20px; text-align: center;">
    <span style="color: #666; font-size: 14px;">🙏 <strong>Thank you to all ${contributors.length} contributors who make Code Guardian possible!</strong></span>
  </div>
</div>

## 🌟 Show Your Support

<div align="center">

### **💖 Love Code Guardian? Here's how you can help:**

<table>
<tr>
<td width="25%" align="center">
  <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 20px; border-radius: 15px; margin: 10px;">
    <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/stargazers" style="text-decoration: none;">
      <img src="https://img.icons8.com/fluency/64/star.png" alt="Star" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));"/>
      <br/><strong style="color: white; font-size: 16px;">⭐ Star</strong>
      <br/><span style="color: rgba(255,255,255,0.9); font-size: 14px;">Give us a star on GitHub</span>
    </a>
  </div>
</td>
<td width="25%" align="center">
  <div style="background: linear-gradient(135deg, #32CD32 0%, #228B22 100%); padding: 20px; border-radius: 15px; margin: 10px;">
    <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/network/members" style="text-decoration: none;">
      <img src="https://img.icons8.com/fluency/64/code-fork.png" alt="Fork" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));"/>
      <br/><strong style="color: white; font-size: 16px;">🍴 Fork</strong>
      <br/><span style="color: rgba(255,255,255,0.9); font-size: 14px;">Fork and contribute</span>
    </a>
  </div>
</td>
<td width="25%" align="center">
  <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%); padding: 20px; border-radius: 15px; margin: 10px;">
    <a href="https://github.com/${REPO_OWNER}/${REPO_NAME}/issues" style="text-decoration: none;">
      <img src="https://img.icons8.com/fluency/64/bug.png" alt="Issues" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));"/>
      <br/><strong style="color: white; font-size: 16px;">🐛 Report</strong>
      <br/><span style="color: rgba(255,255,255,0.9); font-size: 14px;">Report bugs & issues</span>
    </a>
  </div>
</td>
<td width="25%" align="center">
  <div style="background: linear-gradient(135deg, #1E90FF 0%, #0066CC 100%); padding: 20px; border-radius: 15px; margin: 10px;">
    <a href="https://twitter.com/intent/tweet?text=Check%20out%20Code%20Guardian%20-%20AI-powered%20security%20analysis%20platform!%20https://github.com/${REPO_OWNER}/${REPO_NAME}" style="text-decoration: none;">
      <img src="https://img.icons8.com/fluency/64/share.png" alt="Share" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));"/>
      <br/><strong style="color: white; font-size: 16px;">📢 Share</strong>
      <br/><span style="color: rgba(255,255,255,0.9); font-size: 14px;">Spread the word</span>
    </a>
  </div>
</td>
</tr>
</table>

<br/>

</div>`;

  return contributorsHtml;
}

// Main function
async function updateReadmeContributors() {
  try {
    console.log('Starting README contributors update...');
    console.log('Current working directory:', process.cwd());
    console.log('Script file:', import.meta.url);
    
    // Fetch data from GitHub
    const [contributors, repoStats] = await Promise.all([
      fetchContributors(),
      fetchRepoStats()
    ]);
    
    if (contributors.length === 0) {
      console.error('No contributors found. Exiting...');
      return;
    }
    
    // Fetch detailed information for top contributors
    console.log('Fetching detailed contributor information...');
    const topContributors = contributors.slice(0, 8);
    
    for (let i = 0; i < topContributors.length; i++) {
      const details = await fetchUserDetails(topContributors[i].login);
      if (details) {
        topContributors[i] = { ...topContributors[i], ...details };
      }
      
      // Add delay to avoid rate limiting
      if (i < topContributors.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Update contributors array with detailed info
    contributors.splice(0, topContributors.length, ...topContributors);
    
    // Generate new contributors section
    const newContributorsSection = generateContributorsSection(contributors, repoStats);
    
    // Read current README
    const readmePath = path.join(process.cwd(), 'README.md');
    console.log('Reading README from:', readmePath);
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Find the contributors section and replace it
    const startMarker = '## 🌟 Community & Contributors';
    const endMarker = '</table>\r\n\r\n<br/>\r\n\r\n[![GitHub stars]';
    
    const startIndex = readmeContent.indexOf(startMarker);
    const endIndex = readmeContent.indexOf(endMarker, startIndex);
    
    console.log('Start marker found at index:', startIndex);
    console.log('End marker found at index:', endIndex);
    console.log('Looking for end marker:', JSON.stringify(endMarker));
    
    if (startIndex === -1) {
      console.error('Could not find contributors section start marker in README.md');
      return;
    }
    
    if (endIndex === -1) {
      console.error('Could not find contributors section end marker in README.md');
      // Let's see what's actually around that area
      const searchArea = readmeContent.substring(startIndex + 1000, startIndex + 2000);
      console.log('Content around expected end area:', JSON.stringify(searchArea));
      return;
    }
    
    // Replace the contributors section
    const beforeSection = readmeContent.substring(0, startIndex);
    const afterSection = readmeContent.substring(endIndex + endMarker.length);
    
    const updatedReadme = beforeSection + newContributorsSection + '\n\n---' + afterSection;
    
    // Write updated README
    fs.writeFileSync(readmePath, updatedReadme, 'utf8');
    
    console.log('✅ README.md contributors section updated successfully!');
    console.log(`📊 Updated with ${contributors.length} contributors`);
    console.log(`⭐ Repository stats: ${repoStats.stars} stars, ${repoStats.forks} forks`);
    
  } catch (error) {
    console.error('❌ Error updating README contributors:', error);
    process.exit(1);
  }
}

// Run the script
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  updateReadmeContributors();
} else {
  // Always run if called directly
  updateReadmeContributors();
}

export { updateReadmeContributors };