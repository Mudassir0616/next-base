import { East } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PageBanner from "../common/PageBanner";
import GlobalForm from "../common/GlobalForm";
import JobCard from "./JobCard";
import { CareerApi, CareerApplicationApi, CareerCategoryApi } from "@/api/api";
import { useSiteSetting } from "@/context/useSiteSettings";
import { mediaUrl } from "@/utils/functionUtils";
import { mapCareer } from "@/utils/mappers";

const ALL_ROLES = "All Roles";

const Careers = () => {
  const { settings } = useSiteSetting();

  const [activeCategory, setActiveCategory] = useState(ALL_ROLES);
  const [jobs, setJobs] = useState([]);
  const [jobCategories, setJobCategories] = useState([ALL_ROLES]);

  const fetch_jobs = async () => {
    try {
      const [job_res, category_res] = await Promise.all([
        CareerApi.get(`?is_active=true&order_by=order_by`),
        CareerCategoryApi.get(`?order_by=order_by`),
      ]);

      setJobs((job_res?.results || []).map((job) => mapCareer(job)));
      setJobCategories([
        ALL_ROLES,
        ...(category_res?.results || []).map((category) => category.name),
      ]);
    } catch (error) {
      console.error("Failed to fetch careers:", error);
    }
  };

  useEffect(() => {
    fetch_jobs();
  }, []);

  const filteredJobs =
    activeCategory === ALL_ROLES
      ? jobs
      : jobs.filter((job) => job.category === activeCategory);

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
    {
      name: "resume",
      label: "Resume / CV",
      type: "file",
      placeholder: "Drop your resume here or browse",
      helper_text: "PDF, DOC up to 5MB",
      fullWidth: true,
      xs: 12,
    },
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
        title={settings?.career_hero_title}
        description={settings?.career_hero_description}
        image={mediaUrl(settings?.career_hero_image, "/images/career-bg.webp")}
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
