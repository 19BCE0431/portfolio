# LinkedIn Posting Setup

The current portfolio automation does not auto-post to LinkedIn.

LinkedIn posting is manual copy-paste only:

1. The automation drafts the portfolio journal and LinkedIn post.
2. Mohit receives the approval email.
3. Approve Journal publishes only the portfolio journal.
4. The confirmation email includes the final LinkedIn copy with the live journal link.
5. Mohit opens LinkedIn and posts manually.

Keep:

```text
LINKEDIN_AUTO_POST=false
```

## Current Workflow

No LinkedIn OAuth, access token, person URN, or API permission is required for the basic workflow.

The approval route never posts to LinkedIn. It only:

- validates the signed approval token
- changes the journal from `pending_review` to `published`
- prepares the LinkedIn draft as `linkedin_manual_ready`
- emails the final copy-ready LinkedIn text

## Optional Future API Work

LinkedIn API variables may remain in environment templates for future work, but they are optional and unused by the current automation:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_PERSON_URN`
- `LINKEDIN_AUTHOR_URN`
- `LINKEDIN_VERSION`

If auto-posting is ever reconsidered later, it should be built as a separate explicit project using LinkedIn's official OAuth flow and `w_member_social` permission. It should not be mixed into the current approval workflow.

## Why Browser Automation Is Not Used

Browser automation would require saved sessions, cookies, passwords, or UI scraping. That is fragile and unsafe for a professional publishing workflow.

The current system avoids that risk by keeping LinkedIn manual and using email-approved portfolio publishing only.
