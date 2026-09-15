import Link from "next/link";
import React from "react";

/**
 * Centred message panel used by the standalone status pages (404, thank you).
 * `visual` is whatever sits above the heading — an illustration or the code.
 */
const MessagePanel = ({
  visual,
  title,
  description,
  buttonText,
  buttonLink = "/",
}) => {
  return (
    <section className="container">
      <div className="message-panel">
        <div className="content">
          {visual}

          <h1>{title}</h1>
          <p>{description}</p>

          <Link href={buttonLink} className="cta-btn">
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MessagePanel;
