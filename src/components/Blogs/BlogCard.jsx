import { East } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import site from "@/site.config";
import CmsImage from "../common/CmsImage";
import { formatCmsDate, mediaUrl } from "@/utils/functionUtils";

const BlogCard = ({ data }) => {
  const router = useRouter();
  const href = `/blogs/${data?.slug}`;

  return (
    // the whole card is clickable; the "Read more" link is the real anchor
    // for crawlers and keyboards, and stops the click so it navigates once
    <article className="blog-card" onClick={() => router.push(href)}>
      <div>
        <div className="img-container">
          <CmsImage
            src={mediaUrl(data?.thumbnail, site.defaultImage)}
            alt={data?.title || ""}
            width={800}
            height={500}
            sizes="(max-width: 600px) 90vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="content">
          <div className="category">{data?.category?.category}</div>
          <h4 className="line-clamp-2">{data?.title}</h4>
          <p className="line-clamp-2">{data?.sub_title}</p>
        </div>
      </div>
      <div className="bottom-content">
        <Link
          href={href}
          className="read-more"
          onClick={(event) => event.stopPropagation()}
        >
          Read more <East />
        </Link>
        <p>{formatCmsDate(data?.created_at)}</p>
      </div>
    </article>
  );
};

export default BlogCard;
