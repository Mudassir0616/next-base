import Contact from "@/components/Contact/Index";
import Seo from "@/components/common/Seo";
import { seoStaticProps } from "@/utils/functionUtils";

const Index = ({ seo }) => {
    return (
        <>
            <Seo
                title="Contact Us"
                description={seo?.description}
                image={seo?.image}
                path="/contact"
            />

            <Contact />
        </>
    );
};

export const getStaticProps = seoStaticProps("/contact", {
    description: "contact_us_hero_description",
    image: "contact_us_hero_image",
});

export default Index;
