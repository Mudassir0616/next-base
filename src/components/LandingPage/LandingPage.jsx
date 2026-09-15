import { useSiteSetting } from "@/context/useSiteSettings";
import { useRouter } from "next/router";
import React from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeroBanner from "./HeroBanner";
import AboutUs from "./AboutUs";
import ContactFrame from "../common/ContactFrame";
import Blogs from "./Blogs";

const LandingPage = () => {
  const router = useRouter();
  const { settings } = useSiteSetting();

  return (
    <div className="landing-page">
      <HeroBanner />

      <AboutUs />

      <Blogs />

      <ContactFrame
        title="What's Your Next Business Priority?
"
        description="Whether you're looking to strengthen operations, transform technology, access capital, build a GCC or expand into India, Grovanta brings together the expertise and execution capabilities to help you move forward."
        highlightText="Let's turn your next business priority into measurable results.
"
        buttonText="Talk to Our Team"
        buttonLink="/contact"
      />
    </div>
  );
};

export default LandingPage;
