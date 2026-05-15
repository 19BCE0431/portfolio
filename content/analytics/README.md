# Content Analytics

Manual performance tracking for weekly portfolio and LinkedIn content.

Start by filling these files after each post:

- `linkedin-performance.csv`
- `journal-performance.csv`

No API access is required. Do not store tokens, cookies, private messages, exported personal data, or scraped information here.

Run:

```bash
npm run analyze:content-performance
```

The script creates a weekly report in `content/analytics/reports/` and recommends the next topic direction based on the available rows.
