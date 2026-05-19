export type LinkedInPostResult =
  | {
      status: "posted";
      postId: string;
      postUrl?: string;
    }
  | {
      status: "blocked";
      missing: string[];
      reason: string;
    }
  | {
      status: "failed";
      reason: string;
    };

const LINKEDIN_API_VERSION = process.env.LINKEDIN_VERSION || "202602";

export function getLinkedInPostingStatus() {
  const missing: string[] = [];

  if (process.env.LINKEDIN_AUTO_POST !== "true") missing.push("LINKEDIN_AUTO_POST=true");
  if (!process.env.LINKEDIN_ACCESS_TOKEN) missing.push("LINKEDIN_ACCESS_TOKEN");
  if (!getAuthorUrn()) missing.push("LINKEDIN_PERSON_URN or LINKEDIN_AUTHOR_URN");

  return {
    enabled: missing.length === 0,
    missing,
  };
}

export async function publishLinkedInText(commentary: string): Promise<LinkedInPostResult> {
  const status = getLinkedInPostingStatus();

  if (!status.enabled) {
    return {
      status: "blocked",
      missing: status.missing,
      reason: "LinkedIn auto-posting is not fully configured.",
    };
  }

  try {
    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": LINKEDIN_API_VERSION,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: getAuthorUrn(),
        commentary,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    const postId = response.headers.get("x-restli-id") || "";

    if (!response.ok || !postId) {
      return {
        status: "failed",
        reason: `LinkedIn API returned ${response.status}. Check token scope, w_member_social permission, and author URN.`,
      };
    }

    return {
      status: "posted",
      postId,
      postUrl: postId.startsWith("urn:li:share:")
        ? `https://www.linkedin.com/feed/update/${postId}/`
        : undefined,
    };
  } catch {
    return {
      status: "failed",
      reason: "LinkedIn API request failed.",
    };
  }
}

function getAuthorUrn() {
  return process.env.LINKEDIN_PERSON_URN || process.env.LINKEDIN_AUTHOR_URN || "";
}
