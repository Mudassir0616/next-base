import Faqs from "@/components/Faqs/Index";
import Seo from "@/components/common/Seo";
import { seoStaticProps } from "@/utils/functionUtils";

const Index = ({ seo }) => {
    return (
        <>
            <Seo
                title="FAQs"
                description={seo?.description}
                image={seo?.image}
                path="/faqs"
            />

            <Faqs />
        </>
    );
};

export const getStaticProps = seoStaticProps("/faqs", {
    description: "our_faq_hero_description",
    image: "our_faq_hero_image",
});

export default Index;
