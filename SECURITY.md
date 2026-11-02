# Security

## Reporting a vulnerability

Please do not publish details of an unpatched vulnerability in a public issue. Use GitHub's private vulnerability reporting for this repository if the feature is enabled. Otherwise, contact the project owner through a private channel they have explicitly configured.

**Owner action before public launch:** enable and test private vulnerability reporting or publish a monitored security contact. No security contact is configured in this repository yet.

Include the affected URL or file, steps to reproduce, impact, browser/runtime details, and any suggested mitigation. Do not include real user data, credentials, or secrets.

We ask reporters to give the owner a reasonable opportunity to investigate and release a fix before public disclosure. The project will acknowledge reports and coordinate disclosure when a monitored reporting channel is available.

## Security practices

- The site is a static HTML, CSS, JavaScript, and JSON application with no application server or authentication.
- Dataset text is escaped before it is inserted into HTML, and external problem links are generated for the fixed HTTPS LeetCode host.
- A restrictive Content Security Policy and other browser security headers are configured for Vercel.
- Browser storage contains only locally saved solved IDs, bookmark IDs, and the theme preference. Storage is untrusted and may be unavailable.
- No analytics or third-party JavaScript is included. Google Fonts is loaded as a stylesheet and font resource.
- Do not add credentials, API keys, or other secrets to client-side files.

## Limitations

Security headers reduce some browser-side risks; they do not make a website completely secure. The public dataset is downloaded by each visitor and can be copied or scraped. This project does not claim to prevent that. `robots.txt` is a crawler hint, not an access-control mechanism.

If a backend or private data is introduced later, it will need server-side input validation, authentication and authorization where appropriate, rate limiting, abuse monitoring, and access controls.

## Owner checklist

- Configure a private report channel and verify it is monitored.
- Review the dataset's source and redistribution rights before making the site or repository public.
- Re-test the deployed security headers and Content Security Policy after configuration changes.
