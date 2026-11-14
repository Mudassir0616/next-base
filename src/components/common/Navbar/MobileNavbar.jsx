import { Call, KeyboardArrowDown } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import site from "@/site.config";

// Reads the same `site.nav` as the desktop navbar, so the two can't drift.
const MobileNavbar = ({ check, openSubMenu, toggleSubMenu, onNavigate }) => {
  const router = useRouter();

  const go = (href) => {
    onNavigate?.();
    router.push(href);
  };

  return (
    <div className={`mobile-menu ${check ? "active-mobile-menu" : ""}`}>
      <ul>
        {site.nav.map((item) =>
          item.children ? (
            <li
              className={`sub-menu ${openSubMenu?.[item.label] ? "open" : ""}`}
              key={item.label}
            >
              <div
                className="menu-item"
                onClick={() => toggleSubMenu(item.label)}
                role="button"
                tabIndex={0}
                aria-expanded={Boolean(openSubMenu?.[item.label])}
                onKeyDown={(e) => e.key === "Enter" && toggleSubMenu(item.label)}
              >
                <p>{item.label}</p>

                <span className="icon-container">
                  <KeyboardArrowDown />
                </span>
              </div>

              <ul className="sub-links">
                {item.children.map((link) => (
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
