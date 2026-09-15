import { LockOutlined, Send } from "@mui/icons-material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import PageBanner from "../common/PageBanner";
import GlobalForm from "../common/GlobalForm";
import { useSiteSetting } from "@/context/useSiteSettings";
import { stripHtml, splitPipeList } from "@/utils/functionUtils";
import { ContactApi } from "@/api/api";
import { mediaUrl } from "@/utils/functionUtils";

const Contact = () => {
  const router = useRouter();
  const { settings } = useSiteSetting();

  const address =
    stripHtml(settings?.address) ||
    "B3904, Lodha Florenza, Western Express Highway, next to Hub Mall, Goregaon East, Mumbai, Maharashtra 400063";
  const phoneNumbers =
    settings?.api_contact_number?.length > 0
      ? settings.api_contact_number
      : splitPipeList(settings?.contact_number).length > 0
        ? splitPipeList(settings?.contact_number)
        : ["+91 000000000"];
  const email = settings?.email || "support@yourdomain.com";

  const form_config = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
      validation_message: "Full name is required",
      fullWidth: true,
      xs: 12,
      sm: 6,
    },
    {
      name: "company_name",
      label: "Company Name",
      type: "text",
      placeholder: "Your Org Pvt Ltd",
      fullWidth: true,
      xs: 12,
      sm: 6,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter email address",
      required: true,
      validation_message: "Email address is required",
      fullWidth: true,
      xs: 12,
      sm: 6,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "+91 00000 00000",
      fullWidth: true,
      xs: 12,
      sm: 6,
    },
    {
      name: "message",
      label: "Your Message...",
      type: "text",
      placeholder: "Tell us about your requirements",
      rows: 4,
      fullWidth: true,
      xs: 12,
    },
  ];

  const handleSubmit = async (values, resetForm) => {
    // Map the form fields onto the Contact model of the CMS
    const payload = {
      full_name: values.full_name,
      company_name: values.company_name,
      email: values.email,
      phone_number: values.phone,
      requirement: values.message,
      journey_path: typeof window !== "undefined" ? window.location.href : "",
    };

    // APIBase toasts DRF field errors for POST, so only the happy path is here.
    const res = await ContactApi.post("", payload);

    if (res) {
      resetForm();
      router.push("/thank-you");
    }
  };

  return (
    <div className="contact-page">
      <PageBanner
        title={settings?.contact_us_hero_title}
        description={settings?.contact_us_hero_description}
        image={mediaUrl(
          settings?.contact_us_hero_image,
          "/images/contact-bg.webp",
        )}
        position="center 45%"
      />

      <section className="container flex-container contact-section">
        <div className="form-side">
          <div className="contact-form">
            <span className="badge">Send Us a Message</span>

            <h2>
              We&apos;d <span>Love</span> to Hear From You
            </h2>

            <p className="form-note">
              Fill the form below and our team will respond within 24 hours.
            </p>

            <GlobalForm
              form_config={form_config}
              on_Submit={handleSubmit}
              btnClassName="submit-btn"
              btnText={
                <>
                  Send Message <Send />
                </>
              }
            />

            <p className="disclaimer">
              <LockOutlined /> Your data is safe with us · No spam ever
            </p>
          </div>
        </div>

        <div className="details-side">
          <div className="map">
            <iframe
              src={
                settings?.iframe ||
                `https://www.google.com/maps?q=${encodeURIComponent(
                  address,
                )}&output=embed`
              }
              title="Grovanta office location"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="contact-details">
            <div className="detail-row">
              <p className="label">Address</p>
              <p className="value">{address}</p>
            </div>

            <div className="detail-row">
              <p className="label">Contact</p>
              <p className="value">
                {phoneNumbers.map((phone, index) => (
                  <React.Fragment key={phone}>
                    {index > 0 && ", "}
                    <a href={`tel:${phone}`}>{phone}</a>
                  </React.Fragment>
                ))}
              </p>
            </div>

            <div className="detail-row">
              <p className="label">Email</p>
              <a href={`mailto:${email}`} className="value">
                {email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
