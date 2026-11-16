import React from "react";

/**
 * Shared page banner. Every inner page uses the same gradient, height and
 * centered content — only the background image (and optionally its focal
 * point) changes.
 */
const PageBanner = ({
  title,
  description,
  image = "/images/about-bg.webp",
  position = "center center",
  children,
}) => {
  return (
    <div
      className="page-banner"
      style={{
        "--banner-image": `url(${image})`,
        "--banner-position": position,
      }}
    >
      <div className="container">
        <div className="banner-content">
          <h1>{title}</h1>

          {/* a div, not a <p>: CMS descriptions arrive as <p>/<div> markup,
              which can't nest in a <p> and would break hydration */}
          {description && (
            <div
              className="banner-description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default PageBanner;
