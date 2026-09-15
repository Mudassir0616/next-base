import {
  LocationOnOutlined,
  MailOutlined,
  PhoneInTalkOutlined,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteSetting } from "@/context/useSiteSettings";
import { stripHtml, splitPipeList } from "@/utils/functionUtils";

const COMPANY_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blogs", href: "/blogs" },
  { label: "FAQs", href: "/faqs" },
];

const ABOUT_LINKS = [
  { label: "Overview", href: "/about-us" },
  { label: "Our Team", href: "/our-team" },
  { label: "Careers", href: "/careers" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  // { label: "Cookie Policy", href: "/cookie-policy" },
];

const Footer = () => {
  const { settings } = useSiteSetting();
  const [expertise, setExpertise] = useState([]);

  // const fetchData = async () => {
  //   try {
  //     const response = await ExpertiseCategoryApi.get(`?order_by=order_by`);
  //     setExpertise(response?.results || []);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchData();
  // }, []);

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

  const socials = [
    { label: "YouTube", icon: "/icons/yt.svg", href: settings?.youtube },
    { label: "LinkedIn", icon: "/icons/in.svg", href: settings?.linkedin },
    { label: "Instagram", icon: "/icons/ig.svg", href: settings?.instagram },
    {
      label: "Facebook",
      icon: "/icons/facebook.svg",
      href: settings?.facebook,
    },
  ];

  return (
    <div className="footer-container">
      <div className="container">
        <div className="company-details">
          <div className="img-container">
            <img src="/images/logo.png" alt="Grovanta" />
          </div>

          <p>
            Our approach combines strategic thinking, specialized expertise, and
            hands-on execution to deliver measurable business outcomes.
          </p>

          <div className="social-links">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href || "#"}
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
        </div>

        <div className="quick-links">
          <div className="links">
            <p className="title">About Us</p>
            <ul>
              {ABOUT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{ textWrap: "nowrap" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="links">
            <p className="title">Quick Links</p>
            <ul>
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{ textWrap: "nowrap" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="links">
            <p className="title">Our Expertise</p>
            <ul>
              {expertise?.map((area) => (
                <li key={area?.id}>
                  <Link href={`/expertise/${area?.slug}`}>{area?.title}</Link>
                </li>
              ))}
            </ul>
          </div> */}

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
                      <a href={`tel:${phone}`}>{phone}</a>
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
        <p>© {new Date().getFullYear()} [Company Name]. All Rights Reserved.</p>

        <div className="legal">
          {LEGAL_LINKS.map((link) => (
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
