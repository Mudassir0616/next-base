import { ExpandMore } from "@mui/icons-material";
import React, { useCallback, useEffect, useRef, useState } from "react";

/*
 * Clamps a block of CMS html to `collapsedHeight` and reveals the rest on
 * click. The toggle only appears when the copy is genuinely taller than the
 * clamp, so short records render untouched. The measurement re-runs when the
 * html arrives (site settings are fetched in the browser) and whenever the
 * content reflows, since the line count changes with the column width.
 */
const ReadMore = ({
  html,
  collapsedHeight = 180,
  moreLabel = "Read more",
  lessLabel = "Read less",
  className = "",
}) => {
  const contentRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);

  // measured on the inner element, which is never clamped by the max-height
  const measure = useCallback(() => {
    if (contentRef.current) {
      setFullHeight(contentRef.current.getBoundingClientRect().height);
    }
  }, []);

  useEffect(() => {
    measure();

    const element = contentRef.current;

    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [html, measure]);

  const overflows = fullHeight > collapsedHeight + 1;
  const collapsed = overflows && !expanded;

  return (
    <div
      className={`read-more-block ${collapsed ? "is-collapsed" : ""} ${className}`}
    >
      <div
        className="read-more-viewport"
        style={{
          maxHeight: collapsed ? collapsedHeight : fullHeight || "none",
        }}
      >
        <div
          ref={contentRef}
          className="read-more-content"
          dangerouslySetInnerHTML={{ __html: html || "" }}
        />
      </div>

      {overflows && (
        <button
          type="button"
          className={`read-more-toggle ${expanded ? "is-expanded" : ""}`}
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
        >
          {expanded ? lessLabel : moreLabel} <ExpandMore />
        </button>
      )}
    </div>
  );
};

export default ReadMore;
