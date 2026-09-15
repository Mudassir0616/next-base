import { Call, KeyboardArrowDown } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

// Mirrors the desktop nav so the two can't drift apart. Expertise comes from
// the categories the navbar already fetched, so there is only one request.
const buildMenu = (expertise = []) => [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    key: "about",
    links: [
      { label: "Overview", href: "/about-us" },
      { label: "Our Team", href: "/our-team" },
      { label: "Careers", href: "/careers" },
    ],
  },
  // falls back to a plain link while the categories endpoint is unavailable,
  // rather than leaving an accordion that opens onto nothing
  // expertise.length
  //   ? {
  //       label: "Expertise",
  //       key: "expertise",
  //       links: expertise.map((item) => ({
  //         label: item.title,
  //         href: `/expertise/${item.slug}`,
  //       })),
  //     }
  //   : { label: "Expertise", href: "/expertise" },
  {
    label: "Insights",
    key: "insights",
    links: [
      // { label: "Blogs", href: "/blogs" },
      { label: "FAQs", href: "/faqs" },
      { label: "Success Stories", href: "/case-study" },
    ],
  },
];

const MobileNavbar = ({
  check,
  openSubMenu,
  toggleSubMenu,
  onNavigate,
  expertise = [],
}) => {
  const router = useRouter();

  const MENU = buildMenu(expertise);

  const go = (href) => {
    onNavigate?.();
    router.push(href);
  };

  return (
    <div className={`mobile-menu ${check ? "active-mobile-menu" : ""}`}>
      <ul>
        {MENU.map((item) =>
          item.links ? (
            <li
              className={`sub-menu ${openSubMenu?.[item.key] ? "open" : ""}`}
              key={item.label}
            >
              <div
                className="menu-item"
                onClick={() => toggleSubMenu(item.key)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && toggleSubMenu(item.key)}
              >
                <p>{item.label}</p>

                <span className="icon-container">
                  <KeyboardArrowDown />
                </span>
              </div>

              <ul className="sub-links">
                {item.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={onNavigate}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.label}>
              <Link href={item.href} className="menu-item" onClick={onNavigate}>
                {item.label}
              </Link>
            </li>
          ),
        )}
      </ul>

      <button className="cta-btn" onClick={() => go("/contact")}>
        <Call /> Contact Us
      </button>
    </div>
  );
};

export default MobileNavbar;
