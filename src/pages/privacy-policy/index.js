import LegalPage from "@/components/common/LegalPage";
import Seo from "@/components/common/Seo";
import { fetchPageSeo, REVALIDATE_SECONDS } from "@/utils/functionUtils";

const Index = ({ content }) => {
    return (
        <>
            <Seo title="Privacy Policy" description={content} path="/privacy-policy" />
            <LegalPage title="Privacy Policy" html={content} />
        </>
    );
};

export async function getStaticProps() {
    const { seoHead, setting } = await fetchPageSeo("/privacy-policy");

    return {
        props: { seoHead, content: setting.privacy_policy || "" },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
