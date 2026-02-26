import Link from "next/link";
import { Code2, Github, Twitter, Linkedin } from "lucide-react";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Problems", href: "/problems" },
      { label: "Discuss", href: "/discuss" },
      { label: "Roadmap", href: "#roadmap" },
      { label: "Contests", href: "/contests" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "GitHub", href: "https://github.com" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Twitter, label: "Twitter", href: "https://twitter.com" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-dex-border bg-dex-bg">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-dex-accent" />
              <span className="text-base font-bold tracking-tight text-dex-text">DexCode</span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-dex-muted">
              The competitive programming platform for engineers who want to sharpen their skills
              and compete at the highest level.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-dex-muted transition-colors duration-150 hover:bg-dex-surface hover:text-dex-text"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((column) => (
            <div key={column.heading}>
              <h4 className="mb-4 text-xs font-semibold tracking-widest text-dex-text-secondary uppercase">
                {column.heading}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-dex-muted transition-colors duration-150 hover:text-dex-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-dex-border pt-8 sm:flex-row">
          <p className="text-xs text-dex-muted">
            &copy; {new Date().getFullYear()} DexCode. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs text-dex-muted transition-colors hover:text-dex-text"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-dex-muted transition-colors hover:text-dex-text"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
