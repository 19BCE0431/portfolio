import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="section-label mb-5">
      {children}
    </p>
  );
}
