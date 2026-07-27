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
      className="premium-link inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-white/12 bg-white/[0.05] px-3.5 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-[0_10px_32px_rgba(0,0,0,0.3)] backdrop-blur transition hover:border-white/20 hover:bg-white/[0.09]"
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--cyan)]" />
      ) : (
        <Link2 className="h-4 w-4 text-[var(--muted)]" />
      )}
      {copied ? "Copied" : "Copy article link"}
    </button>
  );
}
