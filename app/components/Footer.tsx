import {
  ArrowUpRight,
  FileText,
  Mail,
  MessageCircle,
} from "lucide-react";
import { profile } from "../data/portfolio";

const contacts = [
  { label: "Email", detail: "Start a conversation", href: `mailto:${profile.email}`, icon: Mail },
  { label: "LinkedIn", detail: "Professional profile", href: profile.linkedIn, mark: "in" },
  { label: "Resume", detail: "Open PDF", href: profile.resume, icon: FileText },
  { label: "Instagram", detail: "Outside the work", href: profile.instagram, mark: "ig" },
  { label: "WhatsApp", detail: "A quick hello", href: profile.whatsApp, icon: MessageCircle },
];

export function Footer() {
  return (
    <footer id="contact" className="atelier-footer">
      <div className="atelier-shell">
        <p className="atelier-kicker">Contact · Open to thoughtful work</p>
        <div className="atelier-footer-heading">
          <h2>Build something<br />worth choosing.</h2>
          <p>
            I am interested in product, AI, strategy, and the questions that
            turn an interesting system into a useful decision.
          </p>
        </div>
        <div className="atelier-contact-grid">
          {contacts.map((contact) => {
            const external = contact.href.startsWith("http");
            const Icon = "icon" in contact ? contact.icon : null;
            return (
              <a
                key={contact.label}
                href={contact.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {Icon ? <Icon aria-hidden="true" /> : <i className="atelier-contact-mark" aria-hidden="true">{contact.mark}</i>}
                <span><strong>{contact.label}</strong><small>{contact.detail}</small></span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            );
          })}
        </div>
        <div className="atelier-footer-meta">
          <span>© {new Date().getFullYear()} Mohit Sai Krishna</span>
          <span>India · Product, strategy & applied AI</span>
        </div>
      </div>
    </footer>
  );
}
