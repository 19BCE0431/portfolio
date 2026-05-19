import { timingSafeEqual } from "node:crypto";

export function isAuthorizedCronRequest(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!cronSecret || !authHeader?.startsWith("Bearer ")) {
    return false;
  }

  const tokenBuffer = Buffer.from(authHeader.slice("Bearer ".length));
  const secretBuffer = Buffer.from(cronSecret);

  return (
    tokenBuffer.length === secretBuffer.length &&
    timingSafeEqual(tokenBuffer, secretBuffer)
  );
}
