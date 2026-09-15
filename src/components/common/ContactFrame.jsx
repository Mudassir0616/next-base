import { useRouter } from "next/router";
import React from "react";

const ContactFrame = ({
  title,
  description,
  highlightText,
  buttonText = "Talk to Our Team",
  buttonLink = "/contact",
}) => {
  const router = useRouter();

  return (
    <section className="contact-container">
      <div className="container">
        <div className="content">
          <h2>{title}</h2>

          <p>{description}</p>

          {highlightText && <strong>{highlightText}</strong>}

          <button className="white-cta" onClick={() => router.push(buttonLink)}>
            {buttonText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContactFrame;
