import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type SignedTokenPayload = {
  runId: string;
  action: "approve" | "reject" | "publish";
  exp: number;
  iat?: number;
};

type VerifyResult =
  | { ok: true; payload: SignedTokenPayload }
  | { ok: false; reason: "missing_secret" | "malformed" | "bad_signature" | "expired" };

export function signToken(payload: SignedTokenPayload, secret: string) {
  const encodedPayload = base64UrlEncode(
    JSON.stringify({
      ...payload,
      iat: payload.iat ?? Math.floor(Date.now() / 1000),
    }),
  );
  const signature = sign(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string | null | undefined, secret: string | undefined): VerifyResult {
  if (!secret) return { ok: false, reason: "missing_secret" };
  if (!token) return { ok: false, reason: "malformed" };

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return { ok: false, reason: "malformed" };
  }

  const expected = sign(encodedPayload, secret);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return { ok: false, reason: "bad_signature" };
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(encodedPayload)) as SignedTokenPayload;

    if (!parsed.runId || !parsed.action || !parsed.exp) {
      return { ok: false, reason: "malformed" };
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false, reason: "expired" };
    }

    return { ok: true, payload: parsed };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function compareTokenHash(token: string, hash: string | undefined) {
  if (!hash) return false;

  const actual = Buffer.from(hashToken(token));
  const expected = Buffer.from(hash);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
