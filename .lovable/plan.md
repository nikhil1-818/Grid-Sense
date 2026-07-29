## Goal
Aapke CEA dataset ke saath, app ke saare pages ke full-page screenshots (light theme, individual PNG files) generate karna — report me paste karne ke liye.

## Aapko ek step karna hai
Is chat me apni CEA Excel/CSV file **attach** kar do (Plus button → Attach). File milte hi main aage ka sab kar dunga. (File 20MB tak, 25 states × 365 days wali file easily fit hogi.)

## Main kya karunga

1. **File read + validate** — aapki file ko app ke hi parser rules (date, state, region, demand, solar/wind/hydro/thermal/nuclear) se parse karke check karunga ki columns sahi map ho rahe hain. Koi column mismatch mile to batakar fix karunga.

2. **Headless browser session** — sandbox me Chromium chalakar app me sign in karunga, aapka parsed dataset app ke data store me inject karunga (wahi shape jo upload flow banata hai), aur theme **light** set karunga.

3. **Har page ka full-page screenshot** (charts render hone ka wait karke, taaki koi chart blank na aaye):
   - Landing page (`/`)
   - Upload (`/upload`)
   - Processing pipeline (`/processing`)
   - Executive Dashboard (`/dashboard`)
   - Analytics (`/analytics`)
   - AI Insights (`/insights`)
   - Forecast (`/forecast`)
   - Live Operations (`/live`)
   - Alerts (`/alerts`)
   - Infrastructure (`/infrastructure`)
   - Reports (`/reports`)
   - State detail page (top demand wale 1-2 states)
   - Profile (`/profile`)
   - Settings (`/settings`)
   - Help Center (`/help`)

4. **QA pass** — har screenshot khud inspect karunga: blank charts, clipped text, cut-off sections, loading skeletons. Jo bhi kharab aaya use re-capture karunga.

5. **Delivery** — saari PNGs `/mnt/documents/screenshots/` me numbered naam ke saath (`01-landing.png`, `04-dashboard.png`, …) taaki report me order me lagana easy ho, aur chat me preview gallery bhi dikhegi.

## Technical notes
- Screenshots wide desktop viewport (1440px) par full-page mode me liye jayenge, high DPI so report me sharp dikhein.
- App code me koi change nahi hoga — ye sirf capture kaam hai. Agar light theme me kahin contrast/readability issue dikha to main batakar chhota CSS fix suggest karunga.
- Aapka data sirf capture ke liye use hoga; koi database seeding nahi hogi.
