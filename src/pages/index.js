import Seo from "@/components/common/Seo";
import LandingPage from "@/components/LandingPage/LandingPage";
import { fetchPageSeo, REVALIDATE_SECONDS } from "@/utils/functionUtils";
import { organizationDetailsSchema, websiteSchema } from "@/utils/seo";

export default function Home({ seo, organization }) {
  return (
    <>
      <Seo
        description={seo?.description}
        image={seo?.image}
        path="/"
        jsonLd={[websiteSchema(), organization]}
      />
      <LandingPage />
    </>
  );
}

export async function getStaticProps() {
  const { seoHead, seo, setting } = await fetchPageSeo("/", {
    description: "home_description",
    image: "home_image",
  });

  return {
    props: {
      seoHead,
      seo,
      // built here: the setting record it reads is too large for props
      organization: organizationDetailsSchema(setting),
    },
    revalidate: REVALIDATE_SECONDS,
  };
}
