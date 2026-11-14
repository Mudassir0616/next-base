import { BlogListApi } from "@/api/api";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import BlogCard from "../Blogs/BlogCard";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    try {
      const res = await BlogListApi.get(
        `?depth=2&nested=True&order_by=order_by`,
      );
      setBlogs(res?.results || []);
    } catch (error) {
      console.error("Failed to fetch blog data:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <section className="container">
      <div className="blogs-section">
        <div className="heading">
          <h2>
            <span>Perspective</span> for Businesses Navigating Growth and Change
          </h2>
          <p>
            Explore expert perspectives, industry trends, and practical
            strategies on workforce solutions, business transformation, and
            sustainable growth.
          </p>
        </div>

        <div className="slider">
          <Swiper
            // Swiper needs twice the visible slides to loop; with fewer it
            // warns and disables looping anyway
            loop={blogs.length >= 6}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            spaceBetween={15} // spacing between slides
            slidesPerView={2} // default number of slides to show at a time
            breakpoints={{
              // when the screen is >= 320px (mobile)
              100: {
                slidesPerView: 1.2, // Show 1 full card + partial next card
                spaceBetween: 10,
              },

              600: {
                slidesPerView: 2, // Show 1 full card + partial next card
                spaceBetween: 10,
              },

              1400: {
                slidesPerView: 2.5, // show 4 slides at a time on desktops
                spaceBetween: 20, // larger gap for desktop
              },

              // when the screen is >= 1440px (desktop)
              1600: {
                slidesPerView: 3, // show 4 slides at a time on desktops
                spaceBetween: 20, // larger gap for desktop
              },
            }}
          >
            {blogs?.map((blog, i) => (
              <SwiperSlide key={i}>
                <BlogCard data={blog} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Blogs;
