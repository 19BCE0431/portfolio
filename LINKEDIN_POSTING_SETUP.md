# LinkedIn Posting Setup

This project supports manual LinkedIn posting for approved drafts only. It uses the official LinkedIn Posts API. It does not use browser automation, LinkedIn scraping, saved browser sessions, cookies, or passwords.

The committed weekly workflow does not auto-post to LinkedIn. LinkedIn posting is available only through the manual `Post Approved LinkedIn Draft` workflow after a draft is reviewed and marked `approved`.

Official reference:

- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- LinkedIn OAuth overview: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

## Safety Model

The workflow is approval-first:

1. Weekly insight draft is generated into `content/linkedin-drafts/`.
2. Mohit reviews and edits the draft.
3. The draft frontmatter is changed from `status: "draft"` to `status: "approved"`.
4. The manual GitHub Action `Post Approved LinkedIn Draft` is triggered with the draft slug.
5. The script posts through the official LinkedIn API.
6. Only after a successful API response, the draft is marked `status: "posted"`.

Drafts marked `draft` or `review` are rejected. Drafts already marked `posted` are skipped to prevent duplicate posting.

## LinkedIn Developer App

Create or use a LinkedIn Developer app from the official LinkedIn Developer portal:

1. Open the LinkedIn Developer portal.
2. Create an app and connect it to the correct LinkedIn account.
3. Configure OAuth redirect URLs for your local or production OAuth flow.
4. Request the `w_member_social` permission.
5. Complete any LinkedIn verification steps required for your app.

## OAuth And Access Token

Use LinkedIn's official OAuth flow to obtain an access token with `w_member_social`.

Important:

- Do not paste tokens into source files.
- Do not store tokens in `.env.example`.
- Do not commit `.env.local`.
- Tokens can expire, so expect to refresh or regenerate them through the official OAuth flow.
- If a token is exposed, revoke it immediately.

## Author URN

For personal posting, `LINKEDIN_AUTHOR_URN` should be your member URN in this shape:

```text
urn:li:person:{member_id}
```

The member ID should come from official LinkedIn API/OAuth account data, not scraping the LinkedIn website.

## GitHub Actions Secrets

Add these in:

`Repository Settings -> Secrets and variables -> Actions -> New repository secret`

Required:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN`
- `WEEKLY_INSIGHT_PORTFOLIO_BASE_URL`

Recommended portfolio base URL:

```text
https://mohitsaikrishna.in
```

## Manual Posting

In GitHub:

1. Open `Actions`.
2. Select `Post Approved LinkedIn Draft`.
3. Click `Run workflow`.
4. Enter the draft slug or related blog slug.
5. Run the workflow.

The workflow is manual only. It is not scheduled and is not connected to the weekly generation workflow.

## Why Browser Automation Is Not Allowed

Browser automation would require using browser sessions, cookies, passwords, or UI scraping. That is fragile and unsafe for a professional publishing workflow. The project uses only official APIs so credentials can be managed through OAuth and GitHub Actions secrets.
