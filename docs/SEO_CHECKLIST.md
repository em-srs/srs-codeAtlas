# SEO checklist

## Before launch

- [x] Set a descriptive title, meta description, language, viewport, and robots directive.
- [x] Add Open Graph and X/Twitter titles, descriptions, and card type.
- [ ] Confirm the production domain, then add a matching canonical URL and `og:url`.
- [ ] Create an original social preview image, deploy it, and add its absolute `og:image` URL and dimensions.
- [ ] Replace the example domain in `sitemap.xml.example`, save the resulting file as `sitemap.xml`, and verify every listed URL is live and canonical.
- [ ] Add the sitemap location to `robots.txt` only after a real production URL is known.
- [x] Keep `robots.txt` permissive for the public site and its assets. It is not an access-control mechanism.
- [x] Add conservative `WebSite` structured data without invented organization details, ratings, or claims.
- [ ] Validate the deployed structured data with Google's Rich Results Test or Schema Markup Validator.

## Indexing and quality

- [ ] Verify the production property in Google Search Console and submit the real sitemap.
- [ ] Verify the site in Bing Webmaster Tools and submit the real sitemap.
- [ ] Test mobile usability and performance on real deployed pages.
- [ ] Check indexing, canonical selection, page title, description, and crawl errors after launch.
- [ ] Ensure preview/staging deployments are not unintentionally indexed.
- [ ] Capture actual screenshots and prepare the social image; do not publish placeholder artwork.

## Current SPA limits

Company, topic, and problem views are rendered in client-side JavaScript and are not separate crawlable pages. Query parameters preserve a user-selected view but do not provide stable, descriptive URLs for each entity. Search engines may render JavaScript, but discovery and indexing of individual entities are less dependable than server-rendered or pre-rendered pages. The static app's `WebSite` structured data does not turn its dataset into individual indexed pages.

Do not submit invented entity routes. If entity-level organic discovery becomes a product requirement, consider an approved static-generation migration, such as Astro or Next.js static export, to produce real pages for company, topic, and problem entities while preserving the existing client-side practice experience. Generate canonical links and sitemap entries only for pages that are actually built and publicly available.
