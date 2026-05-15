"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

export function CopyArticleLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    const origin = window.location.origin;
    await navigator.clipboard.writeText(path.startsWith("http") ? path : `${origin}${path}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copyLink}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-black/10 bg-white/45 px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(17,19,19,0.05)] backdrop-blur transition hover:bg-white"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--sage)]" />
      ) : (
        <Link2 className="h-4 w-4 text-[var(--muted)]" />
      )}
      {copied ? "Copied" : "Copy article link"}
    </button>
  );
}
