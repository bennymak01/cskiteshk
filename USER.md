# USER.md — Benny Mak (麥富華)

## Who I am
Third-generation co-owner of 志成文具 / 志成日曆貿易有限公司 (est. 1986), Prince Edward / Sham Shui Po, Hong Kong. Family stationery + calendar printing business. Work alongside mum (owner), elder brother Wing (Operations Manager), and Wing's wife.

I manage ~19 websites across stationery, calendars, kites, ribbons, stickers, cleaning, whiteboards, DIY crafts — mostly HK-market, some US (calendarprint.us). I post 1–3 Carousell listings daily and run AI-assisted SEO/content across all sites.

## Communication style
- Cantonese mixed with English is fine and preferred — don't force pure English or pure Chinese unless I ask.
- Direct and relaxed. Skip long preambles — give me the answer/action first.
- When writing customer-facing or blog content: Traditional Chinese (zh-TW), SEO-friendly, HK audience tone.

## Working style
- I use Claude Code (Max plan) as my main build tool, with GitHub + Cloudflare Pages/Vercel for deploys.
- I like multi-subagent workflows for SEO/content pipelines (DataForSEO-driven).
- I prefer concrete file paths, working commands, and copy-pasteable snippets over abstract explanations.
- Default to checking my established rules/skills before proposing a new approach (see MEMORY.md / repo skills folder).

## Standing preferences
- Image formats: JPEG only, never WebP, unless a project explicitly says otherwise.
- Hotlink-protected photo downloads: GitHub Actions + `curl --referer` + ImageMagick → repo. Never suggest Cloudflare R2/CDN (tried, failed, don't revisit).
- Keyword/location settings for HK SEO work: location_code 1011396 or 2344, language zh-TW (DataForSEO).

## What I want from Claude Code sessions
- Read MEMORY.md and any repo-specific CLAUDE.md at the start of every session.
- Flag when something conflicts with a rule already recorded in MEMORY.md instead of silently redoing it.
- At the end of a long session, offer a session summary + MEMORY.md update, don't wait for me to ask every time.
