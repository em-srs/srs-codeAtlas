# CodeAtlas

CodeAtlas is a static, browser-based practice map for exploring coding interview problems by company, topic, and pattern. Search and combine filters, then track solved problems and bookmarks locally.

## Features

- Browse problems by company, topic, or in a searchable problem table.
- Combine company, topic, pattern, difficulty, and progress filters.
- Sort, paginate, and share filter state through the URL.
- Open problem details and LeetCode search links.
- Save solved status, bookmarks, and dark/light theme in this browser.
- Responsive interface with no backend, account, analytics, or build step.

## Screenshots

Screenshots are not included yet. Add genuine captures of the current application here before public launch; do not use placeholder images as if they were real screenshots.

## Technology

- HTML, CSS, and vanilla JavaScript.
- Static JSON files fetched by the browser.
- Vercel static hosting; Python's built-in HTTP server for local preview.
- Google Fonts (`DM Mono`, `DM Sans`, and `Newsreader`) loaded from Google.

## Project structure

```text
.
├── .gitignore
├── app.js
├── DATASET_REPORT.txt
├── data/
│   ├── meta.json
│   └── problems.json
├── docs/
│   ├── DATA_PROVENANCE.md
│   ├── DEPLOYMENT.md
│   ├── ANTI_SCRAPING.md
│   ├── RELEASE_CHECKLIST.md
│   └── SEO_CHECKLIST.md
├── index.html
├── NOTICE.md
├── PRIVACY.md
├── styles.css
├── robots.txt
├── SECURITY.md
├── sitemap.xml.example
└── vercel.json
```

Additional project policies are in `SECURITY.md`, `PRIVACY.md`, `CONTRIBUTING.md`, and `NOTICE.md`.

## Run locally

From the project root, run:

```bash
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). A local HTTP server is needed because browsers restrict fetching the JSON files from `file://` URLs. No package installation is required.

## Deploy to Vercel

Import the GitHub repository into Vercel and configure:

- Framework Preset: **Other**
- Root Directory: the project root containing `index.html`
- Build Command: blank
- Install Command: blank
- Output Directory: `.`

The site has no environment variables. `vercel.json` configures security headers and finite cache lifetimes. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment, domain, HTTPS, testing, and rollback steps.

## Dataset and provenance

`data/problems.json` and `data/meta.json` were derived from the **All Problems** sheet of the supplied workbook `LEETCODE SHEET.xlsx`; other sheets were excluded to avoid duplicate projections. The workbook is not in this repository. The source and redistribution rights have not been independently verified. Do not assume that receiving a copy grants public distribution permission.

Review [docs/DATA_PROVENANCE.md](docs/DATA_PROVENANCE.md) and resolve rights before making the dataset publicly available. The browser downloads the JSON data, so it can be copied; this project does not claim to prevent scraping. No scraper or automated data collection is included. LeetCode problem statements, editorials, premium content, logos, and proprietary material should not be redistributed without permission.

Company/topic normalization notes: TCS, D. E. Shaw, Booking.com, Meta (Facebook alias in source), and X (Twitter alias in source) are display-name normalizations. `Sort` is merged into `Sorting`; missing topics are represented as `Uncategorized`.

## Security and privacy

Text rendered from the dataset is escaped, links are restricted to HTTPS LeetCode search URLs, local storage is treated as untrusted, and Vercel security headers are configured. Search text is limited to 200 characters. These measures reduce risk but do not make a public static site completely secure. Review [SECURITY.md](SECURITY.md) and [PRIVACY.md](PRIVACY.md) before launch.

The app stores solved IDs, bookmark IDs, and theme preference in the visitor's browser. Search and filter values are reflected in the page URL. Google Fonts requests go to Google; Vercel may process request logs; opening a problem link sends the visitor to LeetCode. There is no analytics or third-party JavaScript in the current project. Verify applicable provider settings and privacy details before publication.

The complete JSON dataset is public and directly downloadable. There is no server-side rate limiter, bot detector, or authentication. Vercel firewall and bot protections must be separately configured in the project dashboard; even those controls cannot prevent a first allowed download of public data. See [docs/ANTI_SCRAPING.md](docs/ANTI_SCRAPING.md) for the threat boundary and owner setup steps.

## SEO and known limitations

The page has descriptive metadata, a `WebSite` structured-data block, and an open `robots.txt`. The canonical URL, `og:url`, social image, and sitemap are intentionally not active until a production domain and preview asset are known. `sitemap.xml.example` is a template, not a sitemap to submit. See [docs/SEO_CHECKLIST.md](docs/SEO_CHECKLIST.md).

Company, topic, and problem views are client-rendered within one page; the app does not create individual crawlable entity pages. Search engines may render JavaScript, but discovery of individual entities is limited. For entity-level search visibility, consider an explicitly approved static-generation migration such as Astro or Next.js static export; no framework migration has been performed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, coding expectations, and dataset-source requirements. Use [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) before a release.

## License and third-party rights

No source-code license has been added; no open-source reuse permission is implied. Dataset rights are separate and unresolved. CodeAtlas is independent and is not affiliated with or endorsed by LeetCode or listed companies. See [NOTICE.md](NOTICE.md).
