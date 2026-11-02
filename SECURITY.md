# Security

## Architecture and threat model

CodeAtlas is a static HTML, CSS, JavaScript, and JSON website. It has no application server, database, account system, cookies, or API endpoints. The browser downloads `data/problems.json` and `data/meta.json` directly from the same public origin; the problem file is about 1.17 MB and contains the complete dataset. Requests for static files are not authenticated.

| Asset or behavior | Realistic threat | Current boundary |
|---|---|---|
| Public dataset and rendered records | Bulk download, repeated fetching, automated indexing | Public by design; a visitor or script can request and copy the JSON or inspect rendered data. No frontend measure can prevent this. |
| Static JavaScript, HTML, and CSS | Source inspection, copying, modified clients | Delivered to the browser and inherently inspectable. No source map or build output is part of the current static project. |
| Search, filters, and query parameters | Very large input, crafted values, DOM injection attempts | Search input and URL state are capped at 200 characters; values are treated as untrusted and escaped in rendered HTML. There is no server-side action behind these parameters. |
| Solved state, bookmarks, theme | Corrupt or attacker-edited browser storage | Stored only in that browser, parsed and validated as untrusted input. It is not authoritative server data. |
| Static hosting and request volume | Repeated downloads, abusive traffic, DDoS | Vercel serves the static files. Platform firewall controls must be configured and monitored in the Vercel project; this repository cannot confirm account settings. |
| Outbound links and fonts | Third-party request/privacy exposure | LeetCode links are HTTPS and opened with `noopener noreferrer`; Google Fonts is loaded as a stylesheet/font resource. |

Likely actors include ordinary visitors, search crawlers, scripts harvesting public content, and attackers probing browser-rendered input. Practical attacks include bulk HTTP downloads, query manipulation, DOM XSS payloads in search/filter values, and high request volume. Authentication bypass, CSRF against an app API, SQL injection, server-side path traversal, and brute force against CodeAtlas accounts do not apply because there is no such backend, account, cookie, or state-changing server endpoint.

## Implemented protections

- Dynamic dataset/user text is escaped before HTML rendering; search content is length-limited, and problem links use a fixed HTTPS LeetCode origin.
- A restrictive Content Security Policy disallows inline style attributes and scripts except for the exact hash-authorized static JSON-LD block. Other configured headers include frame restrictions, MIME sniffing protection, a strict referrer policy, and a restrictive Permissions Policy.
- `localStorage` is parsed, validated, and wrapped for failure; malformed stored progress does not prevent app startup.
- `.gitignore` excludes environment files and browser source maps. Do not put credentials in frontend files; browser code and static configuration are public.
- No analytics, third-party JavaScript, backend endpoints, admin functions, or authentication credentials are used.
- Search terms are limited to 200 characters to avoid unnecessarily expensive client-side matching and oversized shared URLs.

These are defense-in-depth measures, not a guarantee of security or data confidentiality. The CSP and other HTTP response headers must be verified on a real deployment; a local Python server does not apply the Vercel headers.

## Audit status and tests

The security-review agent reported no actionable vulnerabilities in the reviewed project changes. No professional penetration test or third-party service assessment has been performed. The intentionally public dataset is a material exposure if its contents are not meant for public distribution; treat the unresolved provenance and redistribution rights as a launch blocker until verified.

The project has been exercised in a local browser for HTML-injection payload handling, malformed/missing dataset values, corrupt and unavailable storage, external URL shape, keyboard-accessible modal behavior, pagination, filters, and mobile layout. Static checks cover JavaScript syntax, JSON/XML validity, and CSP/JSON-LD compatibility. These tests are not a substitute for checking deployed headers, WAF behavior, or live Vercel configuration.

## Vercel and third-party infrastructure

Vercel's platform firewall, WAF, Bot Protection, rate limiting, and deployment protection are account/deployment settings; they are not enabled by committing this repository. Vercel documents platform DDoS mitigation for all plans, a WAF on all plans, and plan-dependent rate-limit quotas and usage. Review current plan limits, regional counting, pricing, and false-positive impact before publishing rules.

Recommended owner steps are in [docs/ANTI_SCRAPING.md](docs/ANTI_SCRAPING.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). In particular, use standard deployment protection for non-production previews, monitor firewall traffic, and test rules before enforcing them. Do not protect public production pages with authentication unless the product owner intends to make the site private.

## Known limitations

- The public JSON can be requested directly in one HTTP GET; an edge rate limit cannot stop a first successful download.
- Client JavaScript, URLs, records, and CSS are visible to visitors. Obfuscation, disabled right-click, keyboard blocking, or text-selection tricks do not secure them.
- `robots.txt` is a voluntary crawler hint, not access control; noncompliant bots can ignore it.
- Vercel challenge/rate-limit actions may affect legitimate users behind shared IPs or automated testing. Bot classification is not infallible.
- The project has no application-level request logging, per-user identity, or server-side abuse decisions. Those require a backend or edge service.
- The current deployment's Vercel Firewall, deployment protection, billing plan, logs, and domain are not visible from this repository and have not been independently verified.
- The dataset's source and redistribution permissions have not been established. See [docs/DATA_PROVENANCE.md](docs/DATA_PROVENANCE.md).

If data must be confidential or available only to authorized users, do not deploy the full JSON publicly. Use a server-side data service with authentication and authorization, server-side validation, bounded pagination and fields, rate limiting, monitoring, and access controls. Even a public paginated API can be harvested over time; access control and rights to distribute the data are required for meaningful restriction.

## Reporting a vulnerability

Please do not publish details of an unpatched vulnerability in a public issue. Use GitHub's private vulnerability reporting for this repository if the feature is enabled. Otherwise, contact the project owner through a private channel they have explicitly configured.

**Owner action before public launch:** enable and test private vulnerability reporting or publish a monitored security contact. No security contact is configured in this repository yet.

Include the affected URL or file, steps to reproduce, impact, browser/runtime details, and any suggested mitigation. Do not include real user data, credentials, or secrets.

We ask reporters to give the owner a reasonable opportunity to investigate and release a fix before public disclosure. The project will acknowledge reports and coordinate disclosure when a monitored reporting channel is available.

## Owner checklist

- Verify dataset rights before public distribution.
- Configure and monitor a private vulnerability-reporting channel.
- Enable and test Vercel Firewall/Bot Protection settings; do not assume they are configured by `vercel.json`.
- Protect preview deployments; keep intended public production pages crawlable.
- Verify deployed response headers, cache behavior, direct dataset access, and CSP after every relevant deployment change.
