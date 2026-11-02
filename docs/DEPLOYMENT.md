# Deploying CodeAtlas to Vercel

CodeAtlas is a static site: it has no build step, package installation, backend, or environment variables. The production domain is not yet known; use the Vercel preview URL until the owner configures a custom domain and updates the SEO placeholders.

## 1. Prepare and push the repository

Review the dataset rights, owner contact, and launch checklist first. Commit the application and documentation to the GitHub repository. Do not commit `.env` files, credentials, or unreviewed dataset material.

## 2. Import into Vercel

1. Sign in to Vercel and choose **Add New → Project**.
2. Import the intended GitHub repository and authorize access if needed.
3. Confirm the repository root contains `index.html`, `app.js`, and `vercel.json`.
4. Choose **Other** as the Framework Preset.
5. Set the Root Directory to the project root.
6. Leave Build Command and Install Command blank.
7. Set Output Directory to `.` (the project root), matching `vercel.json`.
8. Do not add environment variables; the current site requires none.

## 3. Deploy and test

Deploy, then open the deployment URL. Verify the app loads its data, browse/search/filter/paginate, open and dismiss the modal with keyboard and mouse, save a solved item and bookmark, change theme, and inspect browser console/network errors.

Check response headers on `/`, `/app.js`, `/styles.css`, `/data/problems.json`, and `/data/meta.json`. In particular verify that the Content Security Policy is present and does not block the app or Google Fonts. The static server used locally does not apply Vercel headers; verify them on a Vercel deployment.

## 4. Connect a custom domain and HTTPS

In the Vercel project settings, add the domain and follow the DNS instructions Vercel displays. Wait for verification and HTTPS certificate provisioning. Confirm the HTTPS site works before relying on HSTS. Do not publish a made-up canonical domain.

After confirming the actual domain, update the canonical/`og:url` metadata plan in `index.html`, create and configure a real `sitemap.xml` from `sitemap.xml.example`, add its absolute URL to `robots.txt`, and prepare a real social preview image. Remove placeholder domains before submitting the sitemap or requesting indexing.

## 5. Future deploys and rollback

With Git integration enabled, pushing a commit to the production branch triggers a deployment; other branches and pull requests can receive preview deployments. Review each deployment before promoting changes.

To roll back, open the Vercel project's Deployments list, select a previously successful deployment, and use Vercel's **Promote to Production** or rollback action. Verify the production URL and headers afterward. Vercel dashboard labels can change; follow the current UI if the wording differs.

## Configuration notes

- Framework preset: **Other**.
- Root directory: repository/project root containing `index.html`.
- Build command: blank.
- Install command: blank.
- Output directory: `.`.
- HTML revalidates immediately; JSON revalidates after a short cache window; unversioned CSS/JS are cached for a limited duration, not immutable.
