# WhatsApp Notification Setup

This project can send optional WhatsApp notifications after a weekly draft PR is created or after an approved LinkedIn draft is posted. It uses the official WhatsApp Business Cloud API through Meta Graph API.

It does not use WhatsApp Web, browser automation, personal session hacks, cookies, password scraping, QR-code scraping, or browser profiles.

Official references:

- WhatsApp Cloud API overview: https://developers.facebook.com/docs/whatsapp/cloud-api/
- WhatsApp messages reference: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
- Meta WhatsApp Cloud API Postman collection: https://www.postman.com/meta/whatsapp-business-platform

## Required Values

Add these as GitHub Actions secrets:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TO_NUMBER`
- `WHATSAPP_NOTIFY`

Use this recipient format for Mohit's number:

```text
WHATSAPP_TO_NUMBER=917680030135
```

For local testing, put real values only in `.env.local`. Never commit `.env.local`.

Keep `WHATSAPP_NOTIFY=false` unless you intentionally want workflows to send notifications.

## WhatsApp Business Cloud API Setup

1. Create or use a Meta Developer app.
2. Add WhatsApp to the app.
3. Set up a WhatsApp Business Account and Cloud API phone number.
4. Find the phone number ID in the WhatsApp API setup screen.
5. Generate an access token from Meta's official dashboard or system-user setup.
6. Add the recipient phone number in international format without `+`.
7. Store credentials as GitHub Actions secrets.

## Message Template Considerations

Free-form text messages are usually allowed inside the active customer service window. Outside that window, WhatsApp may require an approved message template depending on account state and Meta policy.

This implementation sends simple text messages:

- `Weekly insight draft is ready for review: {PR_LINK}`
- `Weekly insight published. Blog: {BLOG_URL}. LinkedIn: {LINKEDIN_URL}`
- `Weekly insight workflow needs attention. Check GitHub Actions: {RUN_URL}`

If Meta rejects free-form messages for your account or recipient state, create approved templates in WhatsApp Manager and update `scripts/send-whatsapp-notification.js` later to send template messages.

## Workflow Behavior

The WhatsApp notification is optional:

- If credentials are missing, the script logs `WhatsApp notification skipped: missing configuration`.
- Missing credentials do not fail the workflow.
- Send failures are logged clearly but do not fail the weekly draft or LinkedIn posting workflow.
- Tokens are not printed in logs.

## Local Test

Use `.env.local` for local credentials, then run:

```bash
node scripts/send-whatsapp-notification.js --message "Test notification from the portfolio workflow."
```

Or test a typed message:

```bash
node scripts/send-whatsapp-notification.js --type draft-ready --pr-link "https://github.com/example/repo/pull/1"
```

## Why WhatsApp Web Automation Is Not Allowed

WhatsApp Web automation depends on browser sessions, UI scraping, QR-login state, or personal session cookies. That is fragile, unsafe, and unsuitable for a professional publishing workflow. Official Cloud API credentials make the workflow auditable, revocable, and safe to run in GitHub Actions.
