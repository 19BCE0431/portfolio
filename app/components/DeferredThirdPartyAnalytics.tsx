"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";
import { MicrosoftClarity } from "./MicrosoftClarity";

type DeferredThirdPartyAnalyticsProps = {
  gaMeasurementId?: string;
  clarityProjectId?: string;
};

const engagementEvents = ["pointerdown", "keydown", "scroll"] as const;

export function DeferredThirdPartyAnalytics({
  gaMeasurementId,
  clarityProjectId,
}: DeferredThirdPartyAnalyticsProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const privacyNavigator = navigator as Navigator & {
      globalPrivacyControl?: boolean;
    };

    if (
      privacyNavigator.globalPrivacyControl ||
      navigator.doNotTrack === "1"
    ) {
      return;
    }

    const enable = () => setEnabled(true);
    const timeout = window.setTimeout(enable, 12_000);

    engagementEvents.forEach((eventName) => {
      window.addEventListener(eventName, enable, {
        passive: true,
        once: true,
      });
    });

    return () => {
      window.clearTimeout(timeout);
      engagementEvents.forEach((eventName) => {
        window.removeEventListener(eventName, enable);
      });
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <MicrosoftClarity projectId={clarityProjectId} />
      {gaMeasurementId && <GoogleAnalytics gaId={gaMeasurementId} />}
    </>
  );
}
