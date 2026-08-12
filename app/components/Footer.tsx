import { ArrowUpRight, FileText, Mail, MessageCircle } from "lucide-react";
import { profile } from "../data/portfolio";
import { LineReveal, Magnetic, Reveal, Spotlight } from "./Kinetics";

const contacts = [
  {
    label: "Email",
    detail: profile.email,
    href: `mailto:${profile.email}`,
    icon: Mail,
    note: "Best for anything substantial",
  },
  {
    label: "LinkedIn",
    detail: "in/mohit-sai-krishna-peddakotla",
    href: profile.linkedIn,
    mark: "in",
    note: "Professional profile and posts",
  },
  {
    label: "Resume",
    detail: "PDF · one page",
    href: profile.resume,
    icon: FileText,
    note: "The condensed version",
  },
  {
    label: "WhatsApp",
    detail: "Quick message",
    href: profile.whatsApp,
    icon: MessageCircle,
    note: "For a fast hello",
  },
  {
    label: "Instagram",
    detail: "@ms_krishna9",
    href: profile.instagram,
    mark: "ig",
    note: "Outside the work",
  },
];

export function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-glow" aria-hidden="true" />

      <div className="shell footer-inner">
        <Reveal>
          <p className="eyebrow">Contact · Open to thoughtful work</p>
        </Reveal>

        <div className="footer-head">
          <LineReveal
            as="h2"
            className="footer-title"
            lines={[
              <span key="a">Build something</span>,
              <span key="b">
                worth <span className="editorial lume">choosing.</span>
              </span>,
            ]}
          />
          <Reveal delay={0.15}>
            <p className="lead footer-lead">
              I am interested in product, AI, strategy, and the questions that
              turn an interesting system into a decision someone can act on.
              If that is the kind of problem on your desk, say hello.
            </p>
            <Magnetic strength={0.3}>
              <a href={`mailto:${profile.email}`} className="btn btn-primary">
                Start a conversation <ArrowUpRight aria-hidden="true" />
              </a>
            </Magnetic>
          </Reveal>
        </div>

        <div className="footer-contacts">
          {contacts.map((contact, index) => {
            const external = contact.href.startsWith("http");
            const Icon = "icon" in contact ? contact.icon : null;
            return (
              <Reveal key={contact.label} delay={index * 0.06}>
                <Spotlight as="div" className="footer-contact panel">
                  <a
                    href={contact.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                  >
                    <span className="footer-contact-icon">
                      {Icon ? (
                        <Icon aria-hidden="true" />
                      ) : (
                        <i aria-hidden="true">{contact.mark}</i>
                      )}
                    </span>
                    <span className="footer-contact-copy">
                      <strong>{contact.label}</strong>
                      <small>{contact.detail}</small>
                      <em>{contact.note}</em>
                    </span>
                    <ArrowUpRight className="footer-contact-arrow" aria-hidden="true" />
                  </a>
                </Spotlight>
              </Reveal>
            );
          })}
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          MOHIT SAI KRISHNA
        </div>

        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Mohit Sai Krishna Peddakotla</span>
          <span>India · Product, strategy &amp; applied AI</span>
          <a href="#main-content" className="footer-top">
            Back to top <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
