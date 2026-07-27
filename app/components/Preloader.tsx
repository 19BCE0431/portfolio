"use client";

import { useEffect, useState } from "react";

// Mounts once per hard page load (root layout persists across client nav), so
// the intro plays on first paint and never replays on in-app route changes.
export function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timeout = window.setTimeout(() => setVisible(false), 1050);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="atelier-loader" aria-hidden="true">
      <div className="atelier-loader-mark">MSK</div>
      <div className="atelier-loader-copy">
        <span>Mohit Sai Krishna</span>
        <i />
      </div>
      <span className="atelier-loader-caption">Portfolio · 2026</span>
    </div>
  );
}
