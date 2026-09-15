import { AccessTimeOutlined, LocationOnOutlined } from "@mui/icons-material";
import Link from "next/link";
import React from "react";

const JobCard = ({ job }) => {
  return (
    <div className="job-card">
      <h3>{job.title}</h3>

      <span className="category">{job.category}</span>

      <div className="meta">
        <p>
          <LocationOnOutlined /> {job.location}
        </p>
        <p>
          <AccessTimeOutlined /> {job.type}
        </p>
      </div>

      <p
        className="description"
        dangerouslySetInnerHTML={{ __html: job.description }}
      />

      <Link href={`/careers/${job.slug}`} className="cta-btn">
        Apply Now
      </Link>
    </div>
  );
};

export default JobCard;
