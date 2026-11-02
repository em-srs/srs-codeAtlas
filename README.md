# CodeAtlas

A static, client-side LeetCode practice map built from the supplied `LEETCODE SHEET.xlsx` and PRD.

## Run it

Because browsers restrict `fetch()` from local files, serve this folder with a local static server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

You can also deploy the folder as-is to GitHub Pages, Netlify, or Vercel (static hosting).

## Included

- Company, topic, and problem browsing
- Combined company/topic/pattern/difficulty/status filters
- Search by problem number, title, company, topic, or pattern
- Numbered pagination across company, topic, and problem lists (20/30/50/100 items per page)
- Difficulty and popularity sorting
- Problem details, company/topic quick filters, and LeetCode search links
- Solved and bookmarked progress saved in browser local storage
- Dark/light theme
- URL-shareable filter state
- Responsive layout

## Data

`data/problems.json` is generated from the workbook's **All Problems** sheet. Other sheets are not ingested to avoid duplicate projections. `data/meta.json` contains derived counts and facet lists.

Company display-name normalisations include TCS, D. E. Shaw, Booking.com, Meta (Facebook alias in source), and X (Twitter alias in source). `Sort` is merged into `Sorting`; missing topic values are represented as `Uncategorized`.

## Notes

- This is a zero-backend MVP. Progress is stored in the current browser only.
- The source workbook's redistribution rights should be confirmed before public deployment.
- Company names and LeetCode are used for identification only; CodeAtlas is not affiliated with them.
- LeetCode links use LeetCode's problem search rather than assuming generated slugs are valid.
