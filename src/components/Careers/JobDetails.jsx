import {
  AccessTimeOutlined,
  AddCircle,
  CalendarTodayOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import React from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import PageBanner from "../common/PageBanner";
import GlobalForm from "../common/GlobalForm";
import JobCard from "./JobCard";
import { CareerApplicationApi } from "@/api/api";
import { useSiteSetting } from "@/context/useSiteSettings";
import moment from "moment";

const JobDetails = ({ job, relatedJobs = [] }) => {
  const { settings } = useSiteSetting();
  const form_config = [
    {
      name: "full_name",
      label: "Full Name",
      type: "text",
      placeholder: "Your full name",
      fullWidth: true,
      xs: 12,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "your@email.com",
      fullWidth: true,
      xs: 12,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "+1 (555) 000-0000",
      fullWidth: true,
      xs: 12,
    },
    {
      name: "linkedin",
      label: "LinkedIn Profile",
      type: "text",
      placeholder: "linkedin.com/in/yourname",
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

  // The design shows no required markers here, so the rules live in a schema
  // instead of `required` on each field.
  const custom_schema = Yup.object().shape({
    full_name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email address is required"),
    resume: Yup.mixed().required("Please attach your resume"),
  });

  const handleSubmit = async (values, resetForm) => {
    const payload = new FormData();

    if (job?.id) payload.append("career", job.id);
    payload.append("full_name", values.full_name || "");
    payload.append("email", values.email || "");
    payload.append("phone_number", values.phone || "");
    payload.append("linkedin", values.linkedin || "");

    if (values.resume) payload.append("resume", values.resume);

    // APIBase toasts DRF field errors for POST, so only the happy path is here.
    const res = await CareerApplicationApi.post("", payload);

    if (res) {
      toast.success("Application received — our team will be in touch.");
      resetForm();
    }
  };

  return (
    <div className="careers-page career-detail-page">
      <PageBanner
        title={job?.title}
        image="/images/career-detail-bg.webp"
        position="center 90%"
      >
        <div className="banner-tags">
          <span>
            <LocationOnOutlined /> {job?.location}
          </span>
          <span>
            <AccessTimeOutlined /> {job?.type}
          </span>
          {job?.posted && (
            <span>
              <CalendarTodayOutlined /> Posted {moment(job.posted).fromNow()}
            </span>
          )}
        </div>
      </PageBanner>

      <section className="container flex-container job-detail">
        <div className="content-side">
          <div className="job-section">
            <h2>About the role</h2>
            <div dangerouslySetInnerHTML={{ __html: job?.about || "" }} />
          </div>

          <div className="job-section">
            <h2>What you&apos;ll do</h2>

            <ul>
              {job?.responsibilities?.map((item) => (
                <li key={item}>
                  <div className="icon-container">
                    <img src="/icons/tick.svg" alt="" />
                  </div>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="job-section">
            <h2>What we&apos;re looking for</h2>

            <h4>Required Skills</h4>
            <ul>
              {job?.required_skills?.map((item) => (
                <li key={item}>
                  <div className="icon-container">
                    <img src="/icons/tick.svg" alt="" />
                  </div>
                  <p>{item}</p>
                </li>
              ))}
            </ul>

            <h4>Nice to Haves</h4>
            <ul className="plus-list">
              {job?.nice_to_haves?.map((item) => (
                <li key={item}>
                  <div className="icon-container">
                    <AddCircle />
                  </div>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="about-company">
            <h3>About Grovanta</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: settings?.career_about_description || "",
              }}
            />
          </div>
        </div>

        <div className="form-side">
          <div className="application-form">
            <h3>Apply for this Role</h3>
            <p className="form-note">Fill in your details below</p>

            <GlobalForm
              form_config={form_config}
              custom_schema={custom_schema}
              on_Submit={handleSubmit}
              btnClassName="submit-btn"
              btnText="Submit Application"
            />
          </div>
        </div>
      </section>

      {relatedJobs?.length > 0 && (
        <section className="container related-jobs">
          <div className="heading">
            <h2>
              Related <span>opportunities...</span>
            </h2>

            <Link href="/careers">View more</Link>
          </div>

          <div className="jobs">
            {relatedJobs.map((related) => (
              <JobCard job={related} key={related.slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default JobDetails;
