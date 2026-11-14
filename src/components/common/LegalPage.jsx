import { Breadcrumbs } from "@mui/material";
import Link from "next/link";
import React from "react";

/**
 * Template for the CMS-authored policy pages (privacy, terms, …). `html` is
 * fetched in the page's getStaticProps, so the text is in the prerendered
 * page rather than filled in after load.
 */
const LegalPage = ({ title, html }) => {
  return (
    <div className="container">
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ padding: { lg: "15px 0", xs: "10px 0" } }}
      >
        <Link href="/">Home</Link>
        <p>{title}</p>
      </Breadcrumbs>

      <div className="my-10">
        <h1 className="title-color">{title}</h1>
      </div>

      <div className="terms" dangerouslySetInnerHTML={{ __html: html || "" }} />
    </div>
  );
};

export default LegalPage;
