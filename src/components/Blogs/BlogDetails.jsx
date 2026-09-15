"use client";
import React, { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import { CircularProgress } from "@mui/material";
import { West } from "@mui/icons-material";
import { useRouter } from "next/router";
import moment from "moment";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { BASE_URL } from "@/api/api";
import Link from "next/link";

const BlogDetails = ({ blog_data }) => {
  const router = useRouter();
  const [loading, setloading] = useState(false);

  // Editor uploads come back as relative media paths
  function fixImageUrls(content) {
    return content?.replace(/src="(?:\.\.\/)+media/g, `src="${BASE_URL}/media`);
  }

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/blogs/${blog_data?.slug}`;
  const shareText = blog_data?.title || "Check out this blog";

  // Encode URL properly
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  return (
    <section style={{ margin: 0 }} className="container">
      <div className="blog-details-page">
        <div className="back" onClick={() => router.back()}>
          <West /> Back
        </div>
        {loading ? (
          <div className="loader">
            <CircularProgress sx={{ color: "#7A5CFA" }} />
          </div>
        ) : (
          <div className="blog-detail-container">
            <div className="blog-details">
              <div className="img-container">
                <img src={`${BASE_URL}${blog_data?.thumbnail}`} />
              </div>

              <div className="flex">
                <p className="category">{blog_data?.category?.category}</p>

                <span>
                  {moment(blog_data?.created_at).format("MMMM DD, YYYY")}
                </span>
              </div>

              <div className="banner-content">
                <h1>{blog_data?.title}</h1>
                <p>{blog_data?.sub_title}</p>
              </div>

              <div className="content">
                <div
                  className="featured-text"
                  dangerouslySetInnerHTML={{
                    __html: fixImageUrls(blog_data?.featured_text),
                  }}
                />

                <div
                  className="featured-text"
                  dangerouslySetInnerHTML={{
                    __html: fixImageUrls(blog_data?.text),
                  }}
                />
              </div>
            </div>

            <div className="right">
              <div className="connect">
                <div className="img-container">
                  <img src="/images/g-logo.png" alt="" />
                </div>

                <h6>Looking for the Right Solution?</h6>
                <p>
                  Whether you&apos;re building teams, improving operations, or
                  planning your next stage of growth, we&apos;re here to help.
                </p>

                <button
                  className="cta-btn"
                  onClick={() => router.push("/contact")}
                >
                  Let&apos;s Talk
                </button>
              </div>

              <div className="socials">
                <h5>Share this blog</h5>

                <div className="flex">
                  {/* WhatsApp */}
                  <div
                    className="icon-container"
                    onClick={() =>
                      window.open(
                        `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
                        "_blank",
                      )
                    }
                  >
                    <img src="/icons/wp.svg" alt="WhatsApp" />
                  </div>
                  {/* LinkedIn */}
                  <div
                    className="icon-container"
                    onClick={() =>
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                        "_blank",
                      )
                    }
                  >
                    <img src="/icons/in.svg" alt="LinkedIn" />
                  </div>
                  {/* Instagram */}
                  {/* Instagram does NOT support direct web sharing like others */}
                  <div
                    className="icon-container"
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Blog link copied. Paste it on Instagram.");
                    }}
                  >
                    <img src="/icons/instagram.svg" alt="Instagram" />
                  </div>

                  {/* X / Twitter */}
                  <div
                    className="icon-container"
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
                        "_blank",
                      )
                    }
                  >
                    <img src="/icons/x.svg" alt="X" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {blog_data?.api_recommended?.length > 0 && (
          <section className="recommended-blogs">
            <div className="heading">
              <h2>
                You May Also <span>Like....</span>
              </h2>

              <Link href="/blogs">View more</Link>
            </div>
            <div className="blogs-slider">
              <Swiper
                loop={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0} // spacing between slides
                slidesPerView={1} // default number of slides to show at a time
                scrollbar={{ draggable: true }} // for draggable scrollbar
                breakpoints={{
                  440: {
                    slidesPerView: 1, // Show 1 full card + partial next card
                    spaceBetween: 0,
                  },
                  768: {
                    slidesPerView: 3, // show 2 slides at a time on tablets
                    spaceBetween: 10, // medium gap for tablets
                  },
                  1500: {
                    slidesPerView: 3, // show 4 slides at a time on desktops
                    spaceBetween: 30, // larger gap for desktop
                  },
                  1640: {
                    slidesPerView: 4, // show 4 slides at a time on desktops
                    spaceBetween: 20, // larger gap for desktop
                  },
                }}
              >
                {blog_data?.api_recommended?.map((data, i) => (
                  <SwiperSlide key={i}>
                    <BlogCard data={data} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        )}
      </div>
    </section>
  );
};

export default BlogDetails;
