import {
  ArrowUpRight,
  Camera,
  Contact,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { profile } from "../data/portfolio";

const contactLinks = [
  {
    label: "Email",
    href: `mailto:${profile.email}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: profile.linkedIn,
    icon: Contact,
  },
  {
    label: "Resume",
    href: profile.resume,
    icon: FileText,
  },
  {
    label: "Instagram",
    href: profile.instagram,
    icon: Camera,
  },
  {
    label: "WhatsApp",
    href: profile.whatsApp,
    icon: MessageCircle,
  },
];

export function Footer() {
  return (
    <footer id="contact" className="lux-footer">
      <div className="lux-shell">
        <div className="lux-footer-main">
          <div>
            <p className="lux-eyebrow lux-eyebrow-light">Open to a good conversation</p>
            <h2>Let&apos;s make the next move clearer.</h2>
          </div>
          <p>
            For product, strategy, applied AI, or a thoughtful collaboration —
            choose the channel that feels most natural.
          </p>
        </div>

        <div className="lux-footer-links">
          {contactLinks.map((item) => {
            const Icon = item.icon;
            const isExternal = item.href.startsWith("http");

            return (
              <a
                key={item.label}
                href={item.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noreferrer" : undefined}
              >
                <span>
                  <Icon aria-hidden="true" />
                  {item.label}
                </span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            );
          })}
        </div>

        <div className="lux-footer-meta">
          <span>© {new Date().getFullYear()} {profile.shortName}</span>
          <span><MapPin aria-hidden="true" /> India</span>
          <span>Product · Strategy · Applied AI</span>
        </div>
      </div>
    </footer>
  );
}
