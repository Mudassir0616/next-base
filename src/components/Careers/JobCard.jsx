import { AccessTimeOutlined, LocationOnOutlined } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

const JobCard = ({ job }) => {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>

      <span className="category">{job.api_category?.name}</span>

      <div className="meta">
        <p>
          <LocationOnOutlined /> {job.location}
        </p>
        <p>
          <AccessTimeOutlined /> {job.job_type}
        </p>
      </div>

      {/* a div: the CMS sends this as <p> markup, which can't nest in a <p> */}
      <div
        className="description"
        dangerouslySetInnerHTML={{ __html: job.short_description }}
      />

      <Link href={`/careers/${job.slug}`} className="cta-btn">
        Apply Now
      </Link>
    </div>
  );
};

export default JobCard;
