# Privacy

This notice describes the current CodeAtlas source. The project owner must verify the hosting account's settings and provider terms before publication; this document is not a legal guarantee.

## Data handled in the browser

CodeAtlas saves solved problem IDs and bookmarked problem IDs under `codeatlas-progress-v1`, plus the selected theme under `codeatlas-theme`, in the visitor's browser `localStorage`. This data stays in that browser unless the visitor or browser extensions export it. It is not sent to a CodeAtlas server. The app has no account, sync, or backend. Browser storage can be cleared, disabled, or unavailable; the app reports storage failures.

The public JSON dataset is fetched from the same site. Search terms and filters are kept in the page URL as query parameters so views can be shared. Avoid putting private information in those fields.

## Third parties and hosting

- **Google Fonts:** The page requests font stylesheets from `fonts.googleapis.com` and font files from `fonts.gstatic.com`. Those requests disclose ordinary connection information to Google. The owner should review Google's current terms and decide whether to retain or self-host the fonts.
- **Vercel:** When hosted on Vercel, the provider processes site requests and may retain request or operational logs under the applicable account, plan, and provider terms. The owner must confirm the settings and retention that apply to the deployed project.
- **LeetCode:** Opening a problem link navigates the visitor to LeetCode. LeetCode then handles that visit under its own policies. External links use `rel="noopener noreferrer"` and the site's referrer policy limits cross-origin referrer information.
- **Analytics and tracking:** No analytics, advertising, tracking pixels, or third-party JavaScript are present in this codebase.

## Owner actions before launch

- Confirm the Vercel account's applicable logging, retention, and privacy terms.
- Decide whether Google Fonts will remain a third-party resource or be self-hosted.
- Add an owner contact or privacy-request process if one is required. No contact address or privacy-policy URL is configured here.
- Re-review this notice if analytics, forms, accounts, backend APIs, or other third-party services are added.
