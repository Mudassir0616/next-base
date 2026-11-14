import Careers from "@/components/Careers/Index";
import Seo from "@/components/common/Seo";
import { seoStaticProps } from "@/utils/functionUtils";

const Index = ({ seo }) => {
    return (
        <>
            <Seo
                title="Careers"
                description={seo?.description}
                image={seo?.image}
                path="/careers"
            />

            <Careers />
        </>
    );
};

export const getStaticProps = seoStaticProps("/careers", {
    description: "career_hero_description",
    image: "career_hero_image",
});

export default Index;
