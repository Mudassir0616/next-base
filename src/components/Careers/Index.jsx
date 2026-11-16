import { East } from "@mui/icons-material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import PageBanner from "../common/PageBanner";
import GlobalForm from "../common/GlobalForm";
import JobCard from "./JobCard";
import { CareerApplicationApi } from "@/api/api";
import { mediaUrl } from "@/utils/functionUtils";
import { RESUME_FIELD } from "./resumeField";

const ALL_ROLES = "All Roles";

// `jobs`, `jobCategories` and `hero` come from the page's getStaticProps, so
// the open roles are in the prerendered HTML.
const Careers = ({ hero, jobs = [], jobCategories: categories = [] }) => {
  const [activeCategory, setActiveCategory] = useState(ALL_ROLES);
  const jobCategories = [ALL_ROLES, ...categories.map((category) => category.name)];

  const filteredJobs =
    activeCategory === ALL_ROLES
      ? jobs
      : jobs.filter((job) => job.api_category?.name === activeCategory);

  const benefits = [
    "Be considered for future opportunities that match your expertise",
    "Stay connected with our team as Grovanta continues to grow",
    "Hear from us when a relevant role opens that fits your experience",
  ];

  // the same open roles listed above, so an applicant can name the one they want
  const positionOptions = jobs.map((job) => ({
    value: job.id,
    label: job.title,
  }));

  const form_config = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      required: true,
      validation_message: "Full name is required",
      placeholder: "Enter full name",
      fullWidth: true,
      xs: 12,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      required: true,
      validation_message: "Email address is required",
      placeholder: "Enter email address",
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
      name: "position",
      label: "Position",
      type: "select",
      placeholder: "Select a position",
      options: positionOptions,
      fullWidth: true,
      xs: 12,
    },
    RESUME_FIELD,
  ];

  const handleSubmit = async (values, resetForm) => {
    const payload = new FormData();

    payload.append("full_name", values.full_name || "");
    payload.append("email", values.email || "");
    payload.append("phone_number", values.phone || "");

    // `career` is the backend's own link to a posting — it stays empty for a
    // general application, which is what this form is for
    if (values.position) payload.append("career", values.position);

    if (values.resume) payload.append("resume", values.resume);

    // APIBase toasts DRF field errors for POST, so only the happy path is here.
    const res = await CareerApplicationApi.post("", payload);

    if (res) {
      toast.success("Thanks — we'll get in touch when a relevant role opens.");
      resetForm();
    }
  };

  return (
    <div className="careers-page">
      <PageBanner
        title={hero?.title || "Careers"}
        description={hero?.description}
        image={mediaUrl(hero?.image, "/images/career-bg.webp")}
        position="center 40%"
      />

      <section className="container open-positions">
        <div className="heading">
          <h2>
            Open <span>positions</span>
          </h2>
        </div>

        <div className="faq-chips">
          {jobCategories.map((category) => (
            <button
              key={category}
              className={`chip ${activeCategory === category ? "active" : ""}`}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="jobs">
          {filteredJobs.map((job) => (
            <JobCard job={job} key={job.slug} />
          ))}
        </div>
      </section>

      <section className="container flex-container future-roles">
        <div className="content-side">
          <h2>
            Not the Right Role Today. It <span>Could Be Tomorrow</span>.
          </h2>

          <p>
            While there may not be an opening that matches your expertise today,
            we&apos;re always interested in meeting talented people. Share your
            details with us, and we&apos;ll keep your profile in mind as new
            opportunities arise at Grovanta.
          </p>

          <ul>
            {benefits.map((benefit) => (
              <li key={benefit}>
                <div className="icon-container">
                  <img src="/icons/tick.svg" alt="" />
                </div>
                <p>{benefit}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="form-side">
          <div className="application-form">
            <h3>Submit your Application</h3>
            <p className="form-note">
              All fields are confidential and reviewed daily by HR.
            </p>

            <GlobalForm
              form_config={form_config}
              on_Submit={handleSubmit}
              btnClassName="submit-btn"
              btnText={
                <>
                  Submit My Details <East />
                </>
              }
            />

            <p className="disclaimer">
              By submitting, you agree to our general data handling policies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Careers;
