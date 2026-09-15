import { BASE_URL } from "@/api/api";
import { East } from "@mui/icons-material";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const BlogCard = ({ data }) => {
  const router = useRouter();

  return (
    <article
      className="blog-card"
      onClick={() => router.push(`/blogs/${data?.slug}`)}
    >
      <div>
        <div className="img-container">
          <img src={`${BASE_URL}${data?.thumbnail}`} />
        </div>
        <div className="content">
          <div className="category">{data?.category?.category}</div>
          <h4 className="line-clamp-2">{data?.title}</h4>
          <p className="line-clamp-2">{data?.sub_title}</p>
        </div>
      </div>
      <div className="bottom-content">
        <Link href={`/blogs/${data?.slug}`} className="read-more">
          Read more <East />
        </Link>
        <p>{moment(data?.created_at).format("MMM DD, YYYY")}</p>
      </div>
    </article>
  );
};

export default BlogCard;
