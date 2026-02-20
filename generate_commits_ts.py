import os
import json

def get_author_details(name):
    # Map names to github details
    name_lower = name.lower()
    if "xenonesis" in name_lower or "aditya" in name_lower:
        return {
            "login": "Xenonesis",
            "avatar_url": "https://github.com/Xenonesis.png",
            "html_url": "https://github.com/Xenonesis"
        }
    elif "github action" in name_lower or "bot" in name_lower:
        return {
            "login": "github-actions[bot]",
            "avatar_url": "https://avatars.githubusercontent.com/in/15368?s=64&v=4",
            "html_url": "https://github.com/apps/github-actions"
        }
    elif "_7adi" in name_lower:
        return {
            "login": "_7adi",
            "avatar_url": "https://github.com/_7adi.png",
            "html_url": "https://github.com/_7adi"
        }
    elif "muneerali" in name_lower:
        return {
            "login": "Muneerali199",
            "avatar_url": "https://github.com/Muneerali199.png",
            "html_url": "https://github.com/Muneerali199"
        }
    elif "divya" in name_lower:
        return {
            "login": "DivyaJain09",
            "avatar_url": "https://github.com/DivyaJain09.png",
            "html_url": "https://github.com/DivyaJain09"
        }
    elif "raghavendra" in name_lower:
        return {
            "login": "raghavendra-24",
            "avatar_url": "https://github.com/raghavendra-24.png",
            "html_url": "https://github.com/raghavendra-24"
        }
    elif "shubhranshu" in name_lower:
        return {
            "login": "shubhranshu-sahu",
            "avatar_url": "https://github.com/shubhranshu-sahu.png",
            "html_url": "https://github.com/shubhranshu-sahu"
        }
    elif "sudharshan" in name_lower:
        return {
            "login": "sudharshanpaul",
            "avatar_url": "https://github.com/sudharshanpaul.png",
            "html_url": "https://github.com/sudharshanpaul"
        }
    elif "jils" in name_lower:
        return {
            "login": "Jils31",
            "avatar_url": "https://github.com/Jils31.png",
            "html_url": "https://github.com/Jils31"
        }
    elif "pathan" in name_lower:
        return {
            "login": "pathan-07",
            "avatar_url": "https://github.com/pathan-07.png",
            "html_url": "https://github.com/pathan-07"
        }
    elif "bhuvna" in name_lower:
        return {
            "login": "bhuvnaaaaaa",
            "avatar_url": "https://github.com/bhuvnaaaaaa.png",
            "html_url": "https://github.com/bhuvnaaaaaa"
        }
    elif "barani" in name_lower:
        return {
            "login": "Baranidharanv06",
            "avatar_url": "https://github.com/Baranidharanv06.png",
            "html_url": "https://github.com/Baranidharanv06"
        }
    elif "harsh" in name_lower:
        return {
            "login": "HarshYadav152",
            "avatar_url": "https://github.com/HarshYadav152.png",
            "html_url": "https://github.com/HarshYadav152"
        }
    elif "akshat" in name_lower:
        return {
            "login": "akshatsh0610",
            "avatar_url": "https://github.com/akshatsh0610.png",
            "html_url": "https://github.com/akshatsh0610"
        }
    elif "suranjana" in name_lower:
        return {
            "login": "SuranjanaPaul",
            "avatar_url": "https://github.com/SuranjanaPaul.png",
            "html_url": "https://github.com/SuranjanaPaul"
        }
    elif "vinit" in name_lower:
        return {
            "login": "vinitjain2005",
            "avatar_url": "https://github.com/vinitjain2005.png",
            "html_url": "https://github.com/vinitjain2005"
        }
    
    # Default fallback
    return {
        "login": name,
        "avatar_url": "https://github.com/identicons/" + name + ".png",
        "html_url": ""
    }

commits = []
with open('all_commits.txt', 'r', encoding='utf-8') as f:
    for line in f:
        parts = line.strip().split('|')
        if len(parts) >= 4:
            sha, author_name, date, message = parts[0], parts[1], parts[2], '|'.join(parts[3:])
            
            author_details = get_author_details(author_name)
            
            commit = {
                "sha": sha,
                "commit": {
                    "author": {
                        "name": author_name,
                        "email": "noreply@github.com",
                        "date": date
                    },
                    "message": message
                },
                "html_url": f"https://github.com/Xenonesis/code-guardian-report/commit/{sha}",
                "author": author_details
            }
            commits.append(commit)

# Write to file
with open('src/components/pages/changelog/commitsData.ts', 'w', encoding='utf-8') as f:
    f.write('import { GitHubCommit } from "@/services/api/githubService";\n\n')
    f.write('export const STATIC_COMMITS: GitHubCommit[] = ')
    f.write(json.dumps(commits, indent=2))
    f.write(';\n')

print(f"Generated {len(commits)} commits in src/components/pages/changelog/commitsData.ts")
