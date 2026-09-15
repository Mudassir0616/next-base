import LandingPage from "@/components/LandingPage/LandingPage";
import { fetchGlobalHead, fetchSeoHeads } from "@/utils/functionUtils";

export default function Home() {
  return (
    <>
      <LandingPage />
    </>
  );
}


export async function getStaticProps({ locale }) {
  const currentLocale = locale || "en";

  const [heads, globalHead] = await Promise.all([
    fetchSeoHeads(currentLocale),
    fetchGlobalHead(currentLocale),
  ]);

  return {
    props: {
      heads,
      globalHead
    },
    revalidate: 60,
  };
}
