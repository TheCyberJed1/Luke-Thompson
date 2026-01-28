# Luke Thompson — Portfolio (auto-generated)

This repository now contains a simple static portfolio website intended to be served via GitHub Pages from the repository root (main branch).

Files added:
- index.html — main site
- assets/css/styles.css — styles
- assets/js/main.js — client script (loads your public GitHub repos)
- assets/img/avatar.svg — placeholder avatar

What I set by default:
- Dark theme by default, with a theme toggle (persists in localStorage).
- Projects section auto-populates from your public GitHub repositories (owner: TheCyberJed1).
- Contact email is a placeholder (placeholder@example.com). Replace in index.html.
- Resume content lives in resume/resume-guide.md (SOC Analyst Tier 1 ATS resume). Export to resume.pdf at the repo root to enable a direct download link.

How to customize:
- Edit index.html to change your name, bio, tagline, and email.
- Replace assets/img/avatar.svg with your photo or update the <img> src.
- To add a resume PDF, export resume/resume-guide.md and upload resume.pdf to the repository root.

Publish with GitHub Pages:
1. Go to https://github.com/TheCyberJed1/Luke-Thompson/settings/pages
2. Set the Source to "main" branch and "/ (root)" if it's not already.
3. Save. Your site will be available at https://thecyberjed1.github.io/Luke-Thompson/ (it can take a minute to build).

Notes:
- The site uses the public GitHub REST API without authentication. Very large numbers of requests may hit rate limits. If you want to use a token, update assets/js/main.js to include an Authorization header.
