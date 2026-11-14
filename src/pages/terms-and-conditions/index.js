import LegalPage from "@/components/common/LegalPage";
import Seo from "@/components/common/Seo";
import { fetchPageSeo, REVALIDATE_SECONDS } from "@/utils/functionUtils";

const Index = ({ content }) => {
    return (
        <>
            <Seo title="Terms & Conditions" description={content} path="/terms-and-conditions" />
            <LegalPage title="Terms & Conditions" html={content} />
        </>
    );
};

export async function getStaticProps() {
    const { seoHead, setting } = await fetchPageSeo("/terms-and-conditions");

    return {
        props: { seoHead, content: setting.terms_and_conditions || "" },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
