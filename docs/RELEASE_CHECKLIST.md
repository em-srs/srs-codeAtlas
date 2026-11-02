# Release checklist

## Application

- [ ] Home view and dataset load without console or network errors.
- [ ] Company, topic, and problem browsing work.
- [ ] Search, combined filters, sorting, pagination, and empty results work.
- [ ] Problem details open/close; Escape and focus restoration work.
- [ ] LeetCode links use HTTPS, open the expected search, and use safe `rel` values.
- [ ] Solved status, bookmarks, theme, and URL-shareable filters behave as expected.
- [ ] Invalid/unavailable browser storage does not prevent normal use.
- [ ] Check large result lists and unusual dataset strings.

## Security and privacy

- [ ] Check security headers and CSP on the deployed site; confirm required resources load.
- [ ] Confirm intended preview protection and production Firewall/Bot Protection/rate-limit rules in the Vercel dashboard; repository configuration alone does not enable them.
- [ ] Verify ordinary users and legitimate search crawlers still work after any edge challenge/rate-limit rule is enforced.
- [ ] Confirm the public JSON dataset is directly downloadable and that this is permitted by its rights holder.
- [ ] Check that no secrets, unnecessary scripts, or unreviewed external services were added.
- [ ] Confirm local-storage behavior and privacy documentation match the release.
- [ ] Confirm no placeholder contact or domain is presented as real information.
- [ ] Resolve dataset provenance and redistribution rights before public distribution.

## SEO and content

- [ ] Confirm real canonical and social URLs after the production domain is set.
- [ ] Replace the sitemap template with a valid production `sitemap.xml`; update `robots.txt`.
- [ ] Validate JSON-LD, metadata, social preview image, and sitemap.
- [ ] Check crawlability and indexing settings for production and preview environments.
- [ ] Review terminology and third-party rights notices.

## Performance and accessibility

- [ ] Verify JSON requests and cache headers; do not cache unversioned files immutably.
- [ ] Check mobile layout and common screen sizes.
- [ ] Keyboard-test navigation, filters, cards, modal, focus visibility, and Escape behavior.
- [ ] Check dark/light contrast and reduced-motion behavior.
- [ ] Test current Chrome, Firefox, Safari, and Edge where available.

## Deployment and documentation

- [ ] Follow `docs/DEPLOYMENT.md` using Framework Preset Other, root directory `.`, and no build/install command.
- [ ] Confirm HTTPS and Vercel headers on the deployed site.
- [ ] Review README, SECURITY, PRIVACY, CONTRIBUTING, NOTICE, and docs.
- [ ] Record release commit and verify rollback path.
