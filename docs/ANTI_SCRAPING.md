# Scraping, bots, and abuse

## What is actually public

CodeAtlas is a static site with no API server, database, accounts, or authenticated endpoint. A browser fetches `data/problems.json` and `data/meta.json` from the same origin. The complete problem set is one public JSON file (about 1.17 MB); anyone can download it directly without opening the UI. The visible application and source files can also be inspected in browser developer tools.

This is not a hidden endpoint or a vulnerability that can be fixed with frontend tricks. A public browser client must receive the information it displays. Pagination, minification, filename changes, JavaScript obfuscation, disabled right-click, blocked keyboard shortcuts, or text-selection restrictions would not prevent extraction and are not implemented as security controls.

## Controls in this repository

- `robots.txt` allows ordinary crawlers to access this public static site. It does not constrain noncompliant crawlers or protect files.
- The app has no user-submitted content, server-side mutation, API credentials, admin routes, or data-editing endpoints.
- Search and shareable filter input are capped at 200 characters. This limits avoidable local work and URL growth; it is not an abuse or network rate limit.
- Security headers and a strict CSP reduce browser-side attack surface. They do not limit who can request static assets.

There is **no application-level server rate limit**, bot detector, request-size validation, abuse logging, authentication, or access-control list because there is no application server. Do not describe the input cap or browser code as server-side protection.

## Vercel protections to configure manually

The following are not activated by this repository or confirmed for its Vercel project. Menu names and plan limits can change; consult current Vercel documentation and the project's plan before configuring them.

1. **Protect non-production deployments.** In Vercel Project → **Settings → Deployment Protection**, use Standard Protection for preview/deployment URLs so previews are not generally exposed. Leave the production domain public if public access and search indexing are intended. Do not enable protection for all deployments without confirming the production site should become private.
2. **Review Bot Protection.** In Project → **Firewall**, inspect the available Bot Protection managed ruleset. Begin with a log/monitor action if offered, then consider challenge for traffic classified as non-browser automation. Confirm verified search crawlers remain permitted and test Google/Bing crawling. Challenges and bot fingerprints can have false positives and are not proof that all scrapers are detected.
3. **Observe before enforcing.** Use the Firewall traffic view and alerts to inspect request paths, source IPs, user agents, and available JA4 signals. Do not block based only on a user-agent string. Treat IP/JA4 as imperfect signals, account for shared networks and rotating clients, and document a rollback.
4. **Consider edge rate limiting for the large data file.** In Project → **Firewall → Configure → New Rule**, match the exact path `/data/problems.json`, choose **Rate Limit**, and select an available source key such as IP (and JA4 where available). Current Vercel docs describe fixed windows on all plans; limits, rule counts, pricing, and available keys vary by plan. First deploy in log/monitor mode if available and observe real usage. Then choose a conservative limit and a challenge or deny/429 action that does not disrupt normal visitors. Keep asset requests and verified crawlers in mind.
5. **Protect source maps if ever added.** There are no generated source maps in the current static project. Keep `*.map` out of commits/deployments; if a future workflow genuinely needs production maps, review Vercel Protected Source Maps rather than assuming `.gitignore` protects deployed build output.
6. **Set operational safeguards.** Review Vercel Firewall events and alerts after launch, keep project access restricted to necessary team members, use available spend alerts/limits, and re-check plan-dependent capabilities periodically.

Current Vercel references:

- [Vercel Firewall](https://vercel.com/docs/vercel-firewall)
- [Bot Management](https://vercel.com/docs/bot-management)
- [WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
- [Firewall observability](https://vercel.com/docs/vercel-firewall/firewall-observability)
- [Deployment Protection](https://vercel.com/docs/deployment-protection)
- [Protected Source Maps](https://vercel.com/docs/deployment-protection/protected-source-maps)

Vercel's default DDoS mitigation and WAF capabilities are infrastructure features, but no project-specific rule or Bot Protection mode should be claimed as active until verified in the Vercel dashboard. Edge rate limits can slow repeated downloads and suspicious bursts; they cannot prevent one allowed HTTP GET of the complete public JSON, credential-free copying, IP rotation, or eventual collection over multiple requests. Regional counters and shared IPs can also affect the observed behavior.

## If public scraping is unacceptable

First determine whether public distribution of the workbook-derived dataset is permitted. Removing the public dataset and keeping the site private is the only straightforward way to avoid serving it to unauthenticated visitors.

For genuinely restricted access, replace direct static JSON downloads with a server-side service that authenticates and authorizes requests, validates parameters, limits page size and response fields, rate-limits by identity and network signals, monitors abuse, and prevents unauthorized writes. Store secrets only in server-side environment variables. A public paginated endpoint with no access control can still be enumerated over time; it is not confidentiality. This project deliberately does not add a backend, authentication, fake API, or incomplete rate limiter.

Before any backend is built, decide who is authorized to receive the data and confirm the dataset rights. Add server-side controls only to enforce a real access policy, not to imply that public facts can be made uncopyable.
