import {
  LocationOnOutlined,
  MailOutlined,
  PhoneInTalkOutlined,
} from "@mui/icons-material";
import React from "react";
import Link from "next/link";
import { useSiteSetting } from "@/context/useSiteSettings";
import { stripHtml, splitPipeList } from "@/utils/functionUtils";
import site from "@/site.config";

const Footer = () => {
  const { settings } = useSiteSetting();

  const phoneNumbers =
    settings?.api_contact_number?.length > 0
      ? settings.api_contact_number
      : splitPipeList(settings?.contact_number).length > 0
        ? splitPipeList(settings?.contact_number)
        : ["+91 000000000"];
  const email = settings?.email || "support@yourdomain.com";
  // the CMS returns this wrapped in markup
  const address =
    stripHtml(settings?.address) ||
    "B3904, Lodha Florenza, Western Express Highway, next to Hub Mall, Goregaon East, Mumbai, Maharashtra 400063";

  // a network the CMS has no url for is left out rather than linked to "#"
  const socials = [
    { label: "YouTube", icon: "/icons/yt.svg", href: settings?.youtube },
    { label: "LinkedIn", icon: "/icons/in.svg", href: settings?.linkedin },
    { label: "Instagram", icon: "/icons/ig.svg", href: settings?.instagram },
    {
      label: "Facebook",
      icon: "/icons/facebook.svg",
      href: settings?.facebook,
    },
  ].filter((social) => social.href);

  return (
    <div className="footer-container">
      <div className="container">
        <div className="company-details">
          <div className="img-container">
            <img src={site.logo} alt={site.name} />
          </div>

          <p>
            Our approach combines strategic thinking, specialized expertise, and
            hands-on execution to deliver measurable business outcomes.
          </p>

          {socials.length > 0 && (
            <div className="social-links">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                >
                  <span
                    className="glyph"
                    style={{ "--glyph": `url(${social.icon})` }}
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="quick-links">
          {site.footer.columns.map((column) => (
            <div className="links" key={column.title}>
              <p className="title">{column.title}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} style={{ textWrap: "nowrap" }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="links contact-links">
            <p className="title">Contact</p>
            <ul>
              <li>
                <span className="icon">
                  <PhoneInTalkOutlined />
                </span>
                <span>
                  {phoneNumbers.map((phone, index) => (
                    <React.Fragment key={phone}>
                      {index > 0 && ", "}
                      <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
                    </React.Fragment>
                  ))}
                </span>
              </li>

              <li>
                <span className="icon">
                  <MailOutlined />
                </span>
                <a href={`mailto:${email}`}>{email}</a>
              </li>

              <li>
                <span className="icon">
                  <LocationOnOutlined />
                </span>
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    address,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {address}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="copyright container">
        <p>
          © {new Date().getFullYear()} {site.name}. All Rights Reserved.
        </p>

        <div className="legal">
          {site.footer.legal.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
