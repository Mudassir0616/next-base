import Seo from "@/components/common/Seo";
import LandingPage from "@/components/LandingPage/LandingPage";
import { seoStaticProps } from "@/utils/functionUtils";

export default function Home({ seo }) {
  return (
    <>
      <Seo description={seo?.description} image={seo?.image} path="/" />
      <LandingPage />
    </>
  );
}

export const getStaticProps = seoStaticProps("/", {
  description: "home_description",
  image: "home_image",
});
