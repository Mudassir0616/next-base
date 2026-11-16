import Faqs from "@/components/Faqs/Index";
import Seo from "@/components/common/Seo";
import {
    assertCmsData,
    fetchApi,
    fetchPageSeo,
    listResults,
    REVALIDATE_SECONDS,
} from "@/utils/functionUtils";
import { breadcrumbSchema, faqPageSchema } from "@/utils/seo";

const Index = ({ seo, categories, faqs }) => {
    return (
        <>
            <Seo
                title="FAQs"
                description={seo?.description}
                image={seo?.image}
                path="/faqs"
                jsonLd={[
                    faqPageSchema(faqs),
                    breadcrumbSchema([
                        { name: "Home", path: "/" },
                        { name: "FAQs", path: "/faqs" },
                    ]),
                ]}
            />

            <Faqs hero={seo} categories={categories} faqs={faqs} />
        </>
    );
};

export async function getStaticProps() {
    const [{ seoHead, seo }, categories, faqs] = await Promise.all([
        fetchPageSeo("/faqs", {
            title: "our_faq_hero_title",
            description: "our_faq_hero_description",
            image: "our_faq_hero_image",
        }),
        fetchApi("/api/faq-category/?order_by=order_by&page_size=100"),
        fetchApi("/api/faq/?order_by=order_by&page_size=500"),
    ]);

    assertCmsData(categories, faqs);

    return {
        props: {
            seoHead,
            seo,
            categories: listResults(categories),
            faqs: listResults(faqs),
        },
        revalidate: REVALIDATE_SECONDS,
    };
}

export default Index;
