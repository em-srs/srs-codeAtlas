# Contributing

Thanks for helping improve CodeAtlas. Open an issue to report a reproducible bug or suggest a feature. For code changes, submit a focused pull request that explains the reason for the change and how it was checked.

## Development

The project is intentionally a static HTML, CSS, and vanilla JavaScript site with no package installation or build step. From the project root, run:

```bash
python -m http.server 8000
```

Open `http://localhost:8000` and verify the relevant views and browser console.

## Code expectations

- Preserve the existing visual identity and working features.
- Keep code readable, use semantic HTML, and avoid unnecessary dependencies.
- Escape dataset or user-controlled text before rendering; validate external URLs and keep links safe.
- Do not commit credentials, private data, generated output, or local environment files.
- Test browser storage failure and malformed input paths when changing those areas.

## Dataset contributions

Before proposing a dataset change, document the original source, collection method, date or version, applicable license or permission, and any transformations. Submit only material whose redistribution is authorized. Do not submit unauthorized scraped data, LeetCode problem statements, editorials, premium content, logos, or proprietary material. See [docs/DATA_PROVENANCE.md](docs/DATA_PROVENANCE.md).

## Pull request checklist

- Describe the user-visible change and any limitations.
- Test the site via a local HTTP server.
- Validate changed JSON and `vercel.json`.
- Update relevant documentation.
- Confirm no secrets or unreviewed dataset material were added.
